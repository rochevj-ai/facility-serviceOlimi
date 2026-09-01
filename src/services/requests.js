import { db } from './firebase'
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, orderBy, serverTimestamp, runTransaction
} from 'firebase/firestore'

const COL = 'requests'
const COUNTER_DOC = 'counters/requests'

/* ---- number generator FR-0001 ---- */
export async function getNextNumber() {
  const counterRef = doc(db, COUNTER_DOC)
  const next = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef)
    const current = snap.exists() ? snap.data().seq : 0
    const newSeq = current + 1
    tx.set(counterRef, { seq: newSeq })
    return newSeq
  })
  return `FR-${String(next).padStart(4, '0')}`
}

/* ---- create request ---- */
export async function createRequest(data) {
  const number = await getNextNumber()
  const docData = {
    number,
    status: 'new',
    createdAt: serverTimestamp(),
    company: data.company,
    object: data.object,
    category: data.category,
    description: data.description,
    priority: data.priority,
    deadline: data.deadline,
    deadlineDate: data.deadlineDate || null,
    contact: data.contact,
    contactPhone: data.contactPhone || '',
    assignedTo: null,
    workDescription: '',
    workMinutes: 0,
    mileage: 0,
    materials: [],
    materialCost: 0,
    completedAt: null,
    timeline: [{
      action: 'created',
      by: data.createdBy || data.contact,
      at: new Date().toISOString(),
      note: 'Заявку створено',
    }],
  }
  const docRef = await addDoc(collection(db, COL), docData)
  return { id: docRef.id, ...docData }
}

/* ---- read ---- */
export async function getRequest(id) {
  const snap = await getDoc(doc(db, COL, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function getRequests(filters = {}) {
  let constraints = [orderBy('createdAt', 'desc')]
  if (filters.status) constraints = [where('status', '==', filters.status), ...constraints]
  if (filters.company) constraints = [where('company', '==', filters.company), ...constraints]
  const q = query(collection(db, COL), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/* ---- update status ---- */
export async function updateStatus(id, newStatus, by, note = '') {
  const ref_ = doc(db, COL, id)
  const snap = await getDoc(ref_)
  const data = snap.data()
  const timeline = data.timeline || []
  timeline.push({
    action: newStatus,
    by,
    at: new Date().toISOString(),
    note: note || `Статус: ${newStatus}`,
  })
  const upd = { status: newStatus, timeline }
  if (newStatus === 'done') upd.completedAt = serverTimestamp()
  await updateDoc(ref_, upd)
}

/* ---- complete request ---- */
export async function completeRequest(id, payload) {
  const ref_ = doc(db, COL, id)
  const snap = await getDoc(ref_)
  const data = snap.data()
  const timeline = data.timeline || []
  timeline.push({
    action: 'done',
    by: payload.by || 'Сергій',
    at: new Date().toISOString(),
    note: 'Заявку виконано',
  })
  await updateDoc(ref_, {
    status: 'done',
    completedAt: serverTimestamp(),
    workDescription: payload.workDescription,
    materials: payload.materials || [],
    materialCost: payload.materialCost || 0,
    workMinutes: payload.workMinutes || 0,
    mileage: payload.mileage || 0,
    timeline,
  })
}

/* ---- needs materials ---- */
export async function setNeedsMaterials(id, payload) {
  const ref_ = doc(db, COL, id)
  const snap = await getDoc(ref_)
  const data = snap.data()
  const timeline = data.timeline || []
  timeline.push({
    action: 'needs_materials',
    by: payload.by || 'Сергій',
    at: new Date().toISOString(),
    note: payload.note || 'Потрібні матеріали',
  })
  await updateDoc(ref_, {
    status: 'needs_materials',
    materialsNeeded: payload.materialsNeeded || '',
    estimatedCost: payload.estimatedCost || 0,
    materialsComment: payload.comment || '',
    timeline,
  })
}

/* ---- daily report ---- */
export async function saveDailyReport(report) {
  return addDoc(collection(db, 'dailyReports'), {
    ...report,
    createdAt: serverTimestamp(),
  })
}

/* ---- telegram notify ---- */
export async function sendTelegramNotify(type, data) {
  try {
    const resp = await fetch('/.netlify/functions/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    })
    return resp.ok
  } catch (e) {
    console.warn('Telegram notify failed:', e)
    return false
  }
}
