export const COMPANIES = [
  { id: 'tier', label: 'TIER' },
  { id: 'olimi', label: 'OLIMI' },
  { id: 'like', label: 'LIKE' },
  { id: 'razom', label: 'RAZOM' },
  { id: 'sklad', label: 'Склад' },
  { id: 'office', label: 'Офіс' },
  { id: 'other', label: 'Інше' },
]

export const OBJECTS_BY_COMPANY = {
  tier: ['Швейний цех', 'Стікерування', 'Офіс TIER'],
  olimi: ['Виробництво', 'Склад', 'Офіс OLIMI'],
  like: ['Центр', 'Алмазний', 'Подол', 'Фурманова', 'Героїв', 'Половки', 'Європейська'],
  razom: ['Кафе', 'Майстерня'],
  sklad: ['Основний склад'],
  office: ['Головний офіс'],
  other: ['Інший об\'єкт'],
}

export const CATEGORIES = [
  { id: 'repair', icon: '🔧', label: 'Дрібний ремонт' },
  { id: 'electric', icon: '⚡', label: 'Електрика' },
  { id: 'plumbing', icon: '🚰', label: 'Сантехніка' },
  { id: 'furniture', icon: '🪑', label: 'Меблі' },
  { id: 'doors', icon: '🚪', label: 'Двері / замки' },
  { id: 'painting', icon: '🎨', label: 'Малярні роботи' },
  { id: 'construction', icon: '🧱', label: 'Будівельні роботи' },
  { id: 'lighting', icon: '💡', label: 'Освітлення' },
  { id: 'mounting', icon: '📦', label: 'Монтаж / переміщення' },
  { id: 'territory', icon: '🌳', label: 'Територія' },
  { id: 'equipment', icon: '🛠', label: 'Обладнання' },
  { id: 'housekeeping', icon: '🧹', label: 'Господарські роботи' },
  { id: 'other', icon: '📋', label: 'Інше' },
]

export const PRIORITIES = [
  { id: 'urgent', icon: '🔴', label: 'Терміново', color: '#ef4444', desc: 'Суттєво заважає роботі або створює ризик' },
  { id: 'normal', icon: '🟡', label: 'Звичайна', color: '#eab308', desc: 'Потрібно зробити найближчим часом' },
  { id: 'planned', icon: '🟢', label: 'Планова', color: '#22c55e', desc: 'Косметика, покращення, без терміновості' },
]

export const DEADLINES = [
  { id: 'today', label: 'Сьогодні' },
  { id: 'tomorrow', label: 'Завтра' },
  { id: 'this_week', label: 'На цьому тижні' },
  { id: 'two_weeks', label: 'Впродовж 2 тижнів' },
]

export const STATUSES = [
  { id: 'new', icon: '🆕', label: 'Нова', color: '#3b82f6' },
  { id: 'accepted', icon: '👌', label: 'Прийнята', color: '#8b5cf6' },
  { id: 'driving', icon: '🚗', label: 'Виїхав', color: '#f59e0b' },
  { id: 'in_progress', icon: '🔧', label: 'В роботі', color: '#f97316' },
  { id: 'needs_materials', icon: '🛒', label: 'Потрібні матеріали', color: '#ec4899' },
  { id: 'waiting', icon: '⏸', label: 'Очікує', color: '#6b7280' },
  { id: 'done', icon: '✅', label: 'Виконано', color: '#22c55e' },
  { id: 'cancelled', icon: '❌', label: 'Скасовано', color: '#ef4444' },
]

export function getStatus(id) {
  return STATUSES.find(s => s.id === id) || STATUSES[0]
}

export function getPriority(id) {
  return PRIORITIES.find(p => p.id === id) || PRIORITIES[1]
}

export function getCategory(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[0]
}

export function getCompany(id) {
  return COMPANIES.find(c => c.id === id)
}
