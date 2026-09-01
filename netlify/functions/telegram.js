// Environment variables required:
// TELEGRAM_BOT_TOKEN — from @BotFather
// TELEGRAM_CHAT_ID — group chat ID

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID

  if (!TOKEN || !CHAT_ID) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Telegram not configured' }) }
  }

  try {
    const { type, data } = JSON.parse(event.body)
    let text = ''

    if (type === 'new_request') {
      const priorityMap = { urgent: '🔴 Терміново', normal: '🟡 Звичайна', planned: '🟢 Планова' }
      const deadlineMap = { today: 'сьогодні', tomorrow: 'завтра', this_week: 'цього тижня' }
      text = [
        `🔧 *НОВА ЗАЯВКА #${data.number}*`,
        '',
        `📍 *Об'єкт:* ${data.object}`,
        `🏢 *Напрямок:* ${data.company?.toUpperCase()}`,
        `🛠 *Категорія:* ${data.category}`,
        '',
        priorityMap[data.priority] || data.priority,
        '',
        `*Проблема:*`,
        data.description,
        '',
        `📅 Бажано: ${deadlineMap[data.deadline] || data.deadline}`,
        `👤 Заявник: ${data.contact}`,
        `*Статус: 🆕 Нова*`,
      ].filter(Boolean).join('\n')
    }

    else if (type === 'status_change') {
      const statusLabels = {
        accepted: '👌 прийняв заявку',
        driving: '🚗 виїхав',
        in_progress: '🔧 в роботі',
        needs_materials: '🛒 потрібні матеріали',
        waiting: '⏸ очікує',
        cancelled: '❌ скасовано',
      }
      text = `*${data.number}* → ${statusLabels[data.status] || data.status}. ${data.by}`
    }

    else if (type === 'completed') {
      text = [
        `✅ *ЗАЯВКА #${data.number} ВИКОНАНА*`,
        '',
        `📍 ${data.object}`,
        `🔧 ${data.workDescription}`,
        data.workMinutes ? `⏱ Час: ${data.workMinutes >= 60 ? Math.floor(data.workMinutes / 60) + ' год ' + (data.workMinutes % 60 > 0 ? data.workMinutes % 60 + ' хв' : '') : data.workMinutes + ' хв'}` : '',
        data.mileage ? `🚗 Пробіг: ${data.mileage} км` : '',
        data.materialCost ? `💰 Матеріали: ${data.materialCost} грн` : '',
        `👷 Виконав: ${data.by}`,

      ].filter(Boolean).join('\n')
    }

    else if (type === 'daily_report') {
      text = [
        `📋 *ЗВІТ FACILITY — ${data.date}*`,
        `👷 ${data.employee}`,
        '',
        `✅ Виконано заявок: ${data.completedRequests?.length || 0}`,
        `🔧 Залишилось: ${data.remainingRequests?.length || 0}`,
        `🚗 Пробіг: ${data.mileage} км`,
        `💰 Матеріали: ${data.materialCost} грн`,
        data.totalMinutes ? `⏱ Робочий час: ~${Math.floor(data.totalMinutes / 60)} год ${data.totalMinutes % 60} хв` : '',
        '',
        data.extraWorks?.length ? '*Додатково:*' : '',
        ...(data.extraWorks || []).map(e => `• ${e.company?.toUpperCase() || ''} — ${e.desc}`),
        '',
        data.comment ? `*Коментар:* ${data.comment}` : '',
      ].filter(Boolean).join('\n')
    }

    if (!text) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Unknown type' }) }
    }

    const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    })

    const result = await resp.json()
    return {
      statusCode: resp.ok ? 200 : 500,
      body: JSON.stringify(result),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
