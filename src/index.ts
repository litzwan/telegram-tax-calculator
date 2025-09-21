import 'dotenv/config'
import { Bot, InlineKeyboard } from 'grammy'

const token = process.env.BOT_TOKEN

if (!token) throw new Error('Missing BOT_TOKEN')

const bot = new Bot(token)

let check = 0

const format = new Intl.NumberFormat('ru-RU')

function formatNumber(num: number) {
    return format.format(Math.floor(num))
}

bot.command('start', (ctx) => {
    return ctx.reply('Введите общую сумму чека')
})

bot.on('message:text', (ctx) => {
    const text = ctx.message.text
    const asNumber = Number(text)

    if (!asNumber) {
        return ctx.reply('Введите корректную сумму')
    }

    check = asNumber

    const kb = new InlineKeyboard()
        .text('10%', '10')
        .text('15%', '15')
        .text('20%', '20')

    return ctx.reply('Процент скидки:', {
        reply_markup: kb,
    })
})

bot.callbackQuery(['10', '15', '20'], async (ctx) => {
    const percent = ctx.callbackQuery.data

    await ctx.editMessageReplyMarkup()
    await ctx.editMessageText('⏳ Выполняется...')

    const discountPercent = Number(percent)

    const withoutNds = check - (check * 12) / 100
    const tax = (check * 8) / 100
    const withDiscount = withoutNds - (withoutNds * discountPercent) / 100
    const dirtyProfit = withoutNds - withDiscount
    const profit = dirtyProfit - tax
    const extraProfit = tax - (check * 6) / 100

    await ctx.answerCallbackQuery()

    return ctx.editMessageText(
        [
            `<b>Результаты подсчета:</b>`,
            `• Сумма чека: <b>${formatNumber(check)}</b>`,
            `• Сумма без НДС: <b>${formatNumber(withoutNds)}</b>`,
            `• Налог: <b>${formatNumber(tax)}</b>`,
            `• Без НДС и со скидкой ${percent}%: <b>${formatNumber(withDiscount)}</b>`,
            `• Грязная прибыль: <b>${formatNumber(dirtyProfit)}</b>`,
            `• Прибыль: <b>${formatNumber(profit)}</b>`,
            `• Мне 😁: <b>${formatNumber(profit / 2 + extraProfit)}</b>`,
            `• Не мне 😭: <b>${formatNumber(profit / 2)}</b>`,
        ].join('\n'),
        { parse_mode: 'HTML' }
    )
})

bot.start()
