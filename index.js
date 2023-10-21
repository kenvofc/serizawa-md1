const { modul } = require('./module');
const moment = require('moment-timezone');
const { baileys, boom, chalk, fs, figlet, FileType, path, pino, process, PhoneNumber, axios, yargs, _ } = modul;
const { Boom } = boom
const {
	default: SzBotIncConnect,
	BufferJSON,
	initInMemoryKeyStore,
	DisconnectReason,
	AnyMessageContent,
        makeInMemoryStore,
	useMultiFileAuthState,
	delay,
	fetchLatestBaileysVersion,
	generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    jidDecode,
    getAggregateVotesInPollMessage,
    proto
} = require("@whiskeysockets/baileys")
const { color, bgcolor } = require('./lib/color')
const colors = require('colors')
const { start } = require('./lib/spinner')
const { uncache, nocache } = require('./lib/loader')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep, reSize } = require('./lib/myfunc')

const prefix = ''

global.db = JSON.parse(fs.readFileSync('./database/database.json'))
if (global.db) global.db = {
sticker: {},
database: {}, 
game: {},
others: {},
users: {},
chats: {},
settings: {},
...(global.db || {})
}

const owner = JSON.parse(fs.readFileSync('./database/owner.json'))

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

require('./serizawa.js')
nocache('../Serizawa.js', module => console.log(color('[ CHANGE ]', 'green'), color(`'${module}'`, 'green'), 'Updated'))
require('./index.js')
nocache('../index.js', module => console.log(color('[ CHANGE ]', 'green'), color(`'${module}'`, 'green'), 'Updated'))

async function SzBotIncBot() {
	const {  saveCreds, state } = await useMultiFileAuthState(`./${sessionName}`)
    	const SzBotInc = SzBotIncConnect({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        browser: [`${botname}`,'Safari','3.0'],
        auth: state,
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id)
                return msg.message || undefined
            }
            return {
                conversation: "Serizawa-md fait son entrée sous vos ovations 😌"
            }
        }
    })

    store.bind(SzBotInc.ev)

SzBotInc.ev.on('connection.update', async (update) => {
	const {
		connection,
		lastDisconnect
	} = update
try{
		if (connection === 'close') {
			let reason = new Boom(lastDisconnect?.error)?.output.statusCode
			if (reason === DisconnectReason.badSession) {
				console.log(`Mauvaise session scanne à nouveau `);
				SzBotIncBot()
			} else if (reason === DisconnectReason.connectionClosed) {
				console.log("Connection expirée, reconnection....");
				SzBotIncBot();
			} else if (reason === DisconnectReason.connectionLost) {
				console.log("Connection échouée depuis le Server, reconnection...");
				SzBotIncBot();
			} else if (reason === DisconnectReason.connectionReplaced) {
				console.log("Connection Remplacée, Une Nouvelle Session A Été Ouverte, Veuillez D'abord Fermer La Session Encours");
				SzBotIncBot()
			} else if (reason === DisconnectReason.loggedOut) {
				console.log(`Device Logged Out, Veuillez Scanner A Nouveau.`);
				SzBotIncBot();
			} else if (reason === DisconnectReason.restartRequired) {
				console.log("Restart Required, Restarting...");
				SzBotIncBot();
			} else if (reason === DisconnectReason.timedOut) {
				console.log("Connection TimedOut, Reconnection...");
				SzBotIncBot();
			} else SzBotInc.end(`Unknown DisconnectReason: ${reason}|${connection}`)
		}
		if (update.connection == "connection" || update.receivedPendingNotifications == "false") {
			console.log(color(`\n☣️Connection...`, 'yellow'))
		}
		if (update.connection == "open" || update.receivedPendingNotifications == "true") {
			console.log(color(` `,'magenta'))
            console.log(color(`☣️Connectée à => ` + JSON.stringify(SzBotInc.user, null, 2), 'yellow'))
			await delay(1999)
            console.log(chalk.yellow(`\n\n               ${chalk.bold.blue(`[ ${botname} ]`)}\n\n`))
            console.log(color(`< ================================================== >`, 'cyan'))
	        console.log(color(`\n${themeemoji} YT CHANNEL: `,'magenta'))
            console.log(color(`${themeemoji} GITHUB: serizawa-md `,'magenta'))
            console.log(color(`${themeemoji} INSTAGRAM: @ `,'magenta'))
            console.log(color(`${themeemoji} WA NUMBER: ${owner}`,'magenta'))
            console.log(color(`${themeemoji} CREDIT: ${wm}\n`,'magenta'))
		}
	
} catch (err) {
	  console.log('Error in Connection.update '+err)
	  SzBotIncBot();
	}
	
})

await delay(5555) 
start('2',colors.bold.white('\n\nWaiting for New Messages..'))

SzBotInc.ev.on('creds.update', await saveCreds)

    // Anti Call
    SzBotInc.ev.on('call', async (Kenvofc) => {
    let botNumber = await SzBotInc.decodeJid(SzBotInc.user.id)
    let serizawaBotNum = db.settings[botNumber].anticall
    if (!serizawaBotNum) return
    console.log(Kenvofc)
    for (let KenvFucks of Kenvofc) {
    if (KenvFucks.isGroup == false) {
    if (KenvFucks.status == "offer") {
    let KenvBlokMsg = await SzBotInc.sendTextWithMentions(KenvFucks.from, `*${SzBotInc.user.name}* can't receive ${KenvFucks.isVideo ? `video` : `voice` } call. Sorry @${KenvFucks.from.split('@')[0]} you will be blocked. If accidentally please contact the owner to be unblocked !`)
    SzBotInc.sendContact(KenvFucks.from, global.owner, KenvBlokMsg)
    await sleep(8000)
    await SzBotInc.updateBlockStatus(KenvFucks.from, "block")
    }
    }
    }
    })

SzBotInc.ev.on('messages.upsert', async chatUpdate => {
try {
const kay = chatUpdate.messages[0]
if (!kay.message) return
kay.message = (Object.keys(kay.message)[0] === 'ephemeralMessage') ? kay.message.ephemeralMessage.message : kay.message
if (kay.key && kay.key.remoteJid === 'status@broadcast')  {
await SzBotInc.readMessages([kay.key]) }
if (!SzBotInc.public && !kay.key.fromMe && chatUpdate.type === 'notify') return
if (kay.key.id.startsWith('BAE5') && kay.key.id.length === 16) return
const m = smsg(SzBotInc, kay, store)
require('./Serizawav1')(SzBotInc, m, chatUpdate, store)
} catch (err) {
console.log(err)}})

	// detect group update
		SzBotInc.ev.on("groups.update", async (json) => {
			try {
ppgroup = await SzBotInc.profilePictureUrl(anu.id, 'image')
} catch (err) {
ppgroup = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60'
}
			console.log(json)
			const res = json[0];
			if (res.announce == true) {
				await sleep(2000)
				SzBotInc.sendMessage(res.id, {
					text: `「 Paramètres du groupe modifiés  」\n\nLe groupe a été fermé par un admin, maintenant seuls les admins peuvent envoyer des messages !`,
				});
			} else if (res.announce == false) {
				await sleep(2000)
				SzBotInc.sendMessage(res.id, {
					text: `「 paramètres du groupe modifiés 」\n\nLe groupe a été ouvert par un admin, Maintenant tous les participants peuvent envoyer des messages !`,
				});
			} else if (res.restrict == true) {
				await sleep(2000)
				SzBotInc.sendMessage(res.id, {
					text: `「 paramètres du groupe modifiés 」\n\nLes infos du groupe ont été verouillées, Maintenant seuls les admins peux modifier les infos du groupe  !`,
				});
			} else if (res.restrict == false) {
				await sleep(2000)
				SzBotInc.sendMessage(res.id, {
					text: `「 Group Settings Change 」\n\nGroup info has been opened, Now participants can edit group info !`,
				});
			} else if(!res.desc == ''){
				await sleep(2000)
				SzBotInc.sendMessage(res.id, { 
					text: `「 Paramètres du groupe modifiés 」\n\n*La description du groupe a été modifiée en*\n\n${res.desc}`,
				});
      } else {
				await sleep(2000)
				SzBotInc.sendMessage(res.id, {
					text: `「 Paramètres du groupe modifiés 」\n\n*Le nom du groupe a été modifié en*\n\n*${res.subject}*`,
				});
			} 
			
		});
		
SzBotInc.ev.on('group-participants.update', async (anu) => {
console.log(anu)
try {
let metadata = await SzBotInc.groupMetadata(anu.id)
let participants = anu.participants
for (let num of participants) {
try {
ppuser = await SzBotInc.profilePictureUrl(num, 'image')
} catch (err) {
ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
}
try {
ppgroup = await SzBotInc.profilePictureUrl(anu.id, 'image')
} catch (err) {
ppgroup = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60'
}
//welcome\\
memb = metadata.participants.length
SzWlcm = await getBuffer(ppuser)
SzLft = await getBuffer(ppuser)
                if (anu.action == 'add') {
                const szbuffer = await getBuffer(ppuser)
                let szName = num
                const xtime = moment.tz('West Africa/Yaoundé').format('HH:mm:ss')
	            const xdate = moment.tz('West Africa/Yaoundé').format('DD/MM/YYYY')
	            const xmembers = metadata.participants.length
                Szbody = `┌─❖
│「 𝗛𝗶 👋 」
└┬❖ 「  @${SzName.split("@")[0]}  」
   │✑  𝑾𝒆𝒍𝒄𝒐𝒎𝒆 𝒕𝒐 
   │✑  ${metadata.subject}
   │✑  𝑴𝒆𝒎𝒃𝒆𝒓 : 
   │✑ ${xmembers}th
   │✑  𝑱𝒐𝒊𝒏𝒆𝒅 : 
   │✑ ${xtime} ${xdate}
   └───────────────┈ ⳹`
SzBotInc.sendMessage(anu.id,
 { text: szbody,
 contextInfo:{
 mentionedJid:[num],
 "externalAdReply": {"showAdAttribution": true,
 "containsAutoReply": true,
 "title": ` ${global.botname}`,
"body": `${ownername}`,
 "previewType": "PHOTO",
"thumbnailUrl": ``,
"thumbnail": SzWlcm,
"sourceUrl": `${wagc}`}}})
                } else if (anu.action == 'remove') {
                	const szbuffer = await getBuffer(ppuser)
                    const sztime = moment.tz('West Africa/Yaoundé').format('HH:mm:ss')
	                const szdate = moment.tz('West Africa/Yaoundé').format('DD/MM/YYYY')
                	let szName = num
                    const szmembers = metadata.participants.length
                    szbody = `┌─❖
│「 𝑻𝒖 𝒏𝒆 𝒏𝒐𝒖𝒔 𝒎𝒂𝒏𝒒𝒖𝒆𝒓𝒂𝒔 𝒑𝒂𝒔 👋 」
└┬❖ 「 @${szName.split("@")[0]}  」
   │✑  𝑳𝒆𝒇𝒕 
   │✑ ${metadata.subject}
   │✑  𝑴𝒆𝒎𝒃𝒆𝒓 : 
   │✑ ${szmembers}th
   │✑  𝑻𝒊𝒎𝒆 : 
   │✑  ${sztime} ${szdate}
   └───────────────┈ ⳹`
SzBotInc.sendMessage(anu.id,
 { text: szbody,
 contextInfo:{
 mentionedJid:[num],
 "externalAdReply": {"showAdAttribution": true,
 "containsAutoReply": true,
 "title": ` ${global.botname}`,
"body": `${ownername}`,
 "previewType": "PHOTO",
"thumbnailUrl": ``,
"thumbnail": SzLft,
"sourceUrl": `${wagc}`}}})
} else if (anu.action == 'promote') {
const szbuffer = await getBuffer(ppuser)
const sztime = moment.tz('West Africa/Yaoundé').format('HH:mm:ss')
const szdate = moment.tz('West Africa/Yaoundé').format('DD/MM/YYYY')
let szName = num
szbody = ` 𝑭𝒆𝒍𝒊𝒄𝒊𝒕𝒂𝒕𝒊𝒐𝒏𝒔🎉 @${szName.split("@")[0]}, 𝑻𝒖 𝒂𝒔 𝒆́𝒕𝒆́ 𝒑𝒓𝒐𝒎𝒖(𝒆) 𝒂𝒅𝒎𝒊𝒏𝒔 𝒖𝒏 𝒋𝒐𝒖𝒓 𝒋𝒆 𝒔𝒆𝒓𝒂𝒊 𝒂𝒖𝒔𝒔𝒊 𝒄𝒐𝒎𝒎𝒆 𝒕𝒐𝒊* 🥳` 
   SzBotInc.sendMessage(anu.id,
 { text: szbody,
 contebbo:{
 mentionedJid:[num],
 "externalAdReply": {"showAdAttribution": true,
 "containsAutoReply": true,
 "title": ` ${global.botname}`,
"body": `${ownername}`,
 "previewType": "PHOTO",
"thumbnailUrl": ``,
"thumbnail": SzWlcm,
"sourceUrl": `${wagc}`}}})
} else if (anu.action == 'demote') {
const szbuffer = await getBuffer(ppuser)
const sztime = moment.tz('West Africa/Yaoundé').format('HH:mm:ss')
const szdate = moment.tz('West Africa/Yaoundé').format('DD/MM/YYYY')
let szName = num
szbody = `𝑯𝒂𝒉𝒂𝒉𝒂𝒉𝒂𝒉𝒂🤣🤣🤣‼️ @${szName.split("@")[0]}, 𝑽𝒐𝒖𝒔 𝒂𝒗𝒆𝒛 𝒆́𝒕𝒆́ 𝒅𝒆́𝒎𝒊𝒔 𝒅𝒆 𝒗𝒐𝒔 𝒇𝒐𝒏𝒄𝒕𝒊𝒐𝒏𝒔 𝑯𝒂𝒉𝒂𝒉𝒂𝒉𝒂 𝒒𝒖'𝒆𝒔𝒕-𝒄𝒆 𝒒𝒖𝒆 𝒋𝒆 𝒔𝒖𝒊𝒔 𝒅𝒓𝒐̂𝒍𝒆😂😂😂🤣😭`
SzBotInc.sendMessage(anu.id,
 { text: szbody,
 contextInfo:{
 mentionedJid:[num],
 "externalAdReply": {"showAdAttribution": true,
 "containsAutoReply": true,
 "title": ` ${global.botname}`,
"body": `${ownername}`,
 "previewType": "PHOTO",
"thumbnailUrl": ``,
"thumbnail": SzLft,
"sourceUrl": `${wagc}`}}})
}
}
} catch (err) {
console.log(err)
}
})

    // respon cmd pollMessage
    async function getMessage(key){
        if (store) {
            const msg = await store.loadMessage(key.remoteJid, key.id)
            return msg?.message
        }
        return {
            conversation: "Serizawa-md fait son entrée sous vous ovation!!!"
        }
    }
    SzBotInc.ev.on('messages.update', async chatUpdate => {
        for(const { key, update } of chatUpdate) {
			if(update.pollUpdates && key.fromMe) {
				const pollCreation = await getMessage(key)
				if(pollCreation) {
				    const pollUpdate = await getAggregateVotesInPollMessage({
							message: pollCreation,
							pollUpdates: update.pollUpdates,
						})
	                var toCmd = pollUpdate.filter(v => v.voters.length !== 0)[0]?.name
	                if (toCmd == undefined) return
                    var prefCmd = prefix+toCmd
	                SzBotInc.appenTextMessage(prefCmd, chatUpdate)
				}
			}
		}
    })

SzBotInc.sendTextWithMentions = async (jid, text, quoted, options = {}) => SzBotInc.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })

SzBotInc.decodeJid = (jid) => {
if (!jid) return jid
if (/:\d+@/gi.test(jid)) {
let decode = jidDecode(jid) || {}
return decode.user && decode.server && decode.user + '@' + decode.server || jid
} else return jid
}

SzBotInc.ev.on('contacts.update', update => {
for (let contact of update) {
let id = SzBotInc.decodeJid(contact.id)
if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
}
})

SzBotInc.getName = (jid, withoutContact  = false) => {
id = SzBotInc.decodeJid(jid)
withoutContact = SzBotInc.withoutContact || withoutContact 
let v
if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
v = store.contacts[id] || {}
if (!(v.name || v.subject)) v = SzBotInc.groupMetadata(id) || {}
resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
})
else v = id === '0@s.whatsapp.net' ? {
id,
name: 'WhatsApp'
} : id === SzBotInc.decodeJid(SzBotInc.user.id) ?
SzBotInc.user :
(store.contacts[id] || {})
return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
}

SzBotInc.parseMention = (text = '') => {
return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}

SzBotInc.sendContact = async (jid, kon, quoted = '', opts = {}) => {
	let list = []
	for (let i of kon) {
	    list.push({
	    	displayName: await SzBotInc.getName(i),
	    	vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await SzBotInc.getName(i)}\nFN:${await SzBotInc.getName(i)}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:${ytname}\nitem2.X-ABLabel:YouTube\nitem3.URL:${socialm}\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;${location};;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
	    })
	}
	SzBotInc.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted })
    }

SzBotInc.setStatus = (status) => {
SzBotInc.query({
tag: 'iq',
attrs: {
to: '@s.whatsapp.net',
type: 'set',
xmlns: 'status',
},
content: [{
tag: 'status',
attrs: {},
content: Buffer.from(status, 'utf-8')
}]
})
return status
}

SzBotInc.public = true

SzBotInc.sendImage = async (jid, path, caption = '', quoted = '', options) => {
let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
return await SzBotInc.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
}

SzBotInc.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImg(buff, options)
} else {
buffer = await imageToWebp(buff)
}
await SzBotInc.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
.then( response => {
fs.unlinkSync(buffer)
return response
})
}

SzBotInc.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifVid(buff, options)
} else {
buffer = await videoToWebp(buff)
}
await SzBotInc.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer
}

SzBotInc.copyNForward = async (jid, message, forceForward = false, options = {}) => {
let vtype
if (options.readViewOnce) {
message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
vtype = Object.keys(message.message.viewOnceMessage.message)[0]
delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
delete message.message.viewOnceMessage.message[vtype].viewOnce
message.message = {
...message.message.viewOnceMessage.message
}
}
let mtype = Object.keys(message.message)[0]
let content = await generateForwardMessageContent(message, forceForward)
let ctype = Object.keys(content)[0]
let context = {}
if (mtype != "conversation") context = message.message[mtype].contextInfo
content[ctype].contextInfo = {
...context,
...content[ctype].contextInfo
}
const waMessage = await generateWAMessageFromContent(jid, content, options ? {
...content[ctype],
...options,
...(options.contextInfo ? {
contextInfo: {
...content[ctype].contextInfo,
...options.contextInfo
}
} : {})
} : {})
await SzBotInc.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id })
return waMessage
}

SzBotInc.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
let quoted = message.msg ? message.msg : message
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(quoted, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
let type = await FileType.fromBuffer(buffer)
trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
await fs.writeFileSync(trueFileName, buffer)
return trueFileName
}

SzBotInc.downloadMediaMessage = async (message) => {
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(message, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
return buffer
}

SzBotInc.getFile = async (PATH, save) => {
let res
let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
let type = await FileType.fromBuffer(data) || {
mime: 'application/octet-stream',
ext: '.bin'}
filename = path.join(__filename, './lib' + new Date * 1 + '.' + type.ext)
if (data && save) fs.promises.writeFile(filename, data)
return {
res,
filename,
size: await getSizeMedia(data),
...type,
data}}

SzBotInc.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
let types = await SzBotInc.getFile(path, true)
let { mime, ext, res, data, filename } = types
if (res && res.status !== 200 || file.length <= 65536) {
try { throw { json: JSON.parse(file.toString()) } }
catch (e) { if (e.json) throw e.json }}
let type = '', mimetype = mime, pathFile = filename
if (options.asDocument) type = 'document'
if (options.asSticker || /webp/.test(mime)) {
let { writeExif } = require('./lib/exif')
let media = { mimetype: mime, data }
pathFile = await writeExif(media, { packname: options.packname ? options.packname : global.packname, author: options.author ? options.author : global.author, categories: options.categories ? options.categories : [] })
await fs.promises.unlink(filename)
type = 'sticker'
mimetype = 'image/webp'}
else if (/image/.test(mime)) type = 'image'
else if (/video/.test(mime)) type = 'video'
else if (/audio/.test(mime)) type = 'audio'
else type = 'document'
await SzBotInc.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ...options })
return fs.promises.unlink(pathFile)}

SzBotInc.sendText = (jid, text, quoted = '', options) => SzBotInc.sendMessage(jid, { text: text, ...options }, { quoted })

SzBotInc.serializeM = (m) => smsg(SzBotInc, m, store)

SzBotInc.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
let buttonMessage = {
text,
footer,
buttons,
headerType: 2,
...options
}
SzBotInc.sendMessage(jid, buttonMessage, { quoted, ...options })
}

SzBotInc.sendKatalog = async (jid , title = '' , desc = '', gam , options = {}) =>{
let message = await prepareWAMessageMedia({ image: gam }, { upload: SzBotInc.waUploadToServer })
const tod = generateWAMessageFromContent(jid,
{"productMessage": {
"product": {
"productImage": message.imageMessage,
"productId": "9999",
"title": title,
"description": desc,
"currencyCode": "INR",
"priceAmount1000": "100000",
"url": `${websitex}`,
"productImageCount": 1,
"salePriceAmount1000": "0"
},
"businessOwnerJid": `${ownernumber}@s.whatsapp.net`
}
}, options)
return SzBotInc.relayMessage(jid, tod.message, {messageId: tod.key.id})
} 

SzBotInc.send5ButLoc = async (jid , text = '' , footer = '', img, but = [], options = {}) =>{
var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
templateMessage: {
hydratedTemplate: {
"hydratedContentText": text,
"locationMessage": {
"jpegThumbnail": img },
"hydratedFooterText": footer,
"hydratedButtons": but
}
}
}), options)
SzBotInc.relayMessage(jid, template.message, { messageId: template.key.id })
}

SzBotInc.sendButImg = async (jid, path, teks, fke, but) => {
let img = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let fjejfjjjer = {
image: img, 
jpegThumbnail: img,
caption: teks,
fileLength: "1",
footer: fke,
buttons: but,
headerType: 4,
}
SzBotInc.sendMessage(jid, fjejfjjjer, { quoted: m })
}

            /**
             * Send Media/File with Automatic Type Specifier
             * @param {String} jid
             * @param {String|Buffer} path
             * @param {String} filename
             * @param {String} caption
             * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} quoted
             * @param {Boolean} ptt
             * @param {Object} options
             */
SzBotInc.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
                let type = await SzBotInc.getFile(path, true)
                let { res, data: file, filename: pathFile } = type
                if (res && res.status !== 200 || file.length <= 65536) {
                    try { throw { json: JSON.parse(file.toString()) } }
                    catch (e) { if (e.json) throw e.json }
                }
                const fileSize = fs.statSync(pathFile).size / 1024 / 1024
                if (fileSize >= 1800) throw new Error(' The file size is too large\n\n')
                let opt = {}
                if (quoted) opt.quoted = quoted
                if (!type) options.asDocument = true
                let mtype = '', mimetype = options.mimetype || type.mime, convert
                if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker'
                else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image'
                else if (/video/.test(type.mime)) mtype = 'video'
                else if (/audio/.test(type.mime)) (
                    convert = await toAudio(file, type.ext),
                    file = convert.data,
                    pathFile = convert.filename,
                    mtype = 'audio',
                    mimetype = options.mimetype || 'audio/ogg; codecs=opus'
                )
                else mtype = 'document'
                if (options.asDocument) mtype = 'document'

                delete options.asSticker
                delete options.asLocation
                delete options.asVideo
                delete options.asDocument
                delete options.asImage

                let message = {
                    ...options,
                    caption,
                    ptt,
                    [mtype]: { url: pathFile },
                    mimetype,
                    fileName: filename || pathFile.split('/').pop()
                }
                /**
                 * @type {import('@adiwajshing/baileys').proto.WebMessageInfo}
                 */
                let m
                try {
                    m = await SzBotInc.sendMessage(jid, message, { ...opt, ...options })
                } catch (e) {
                    console.error(e)
                    m = null
                } finally {
                    if (!m) m = await SzBotInc.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options })
                    file = null // releasing the memory
                    return m
                }
            }

//ScBotInc.sendFile = async (jid, media, options = {}) => {
        //let file = await SzBotInc.getFile(media)
        //let mime = file.ext, type
        //if (mime == "mp3") {
          //type = "audio"
          //options.mimetype = "audio/mpeg"
          //options.ptt = options.ptt || false
        //}
        //else if (mime == "jpg" || mime == "jpeg" || mime == "png") type = "image"
        //else if (mime == "webp") type = "sticker"
        //else if (mime == "mp4") type = "video"
        //else type = "document"
        //return SzBotInc.sendMessage(jid, { [type]: file.data, ...options }, { ...options })
      //}

SzBotInc.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
      let mime = '';
      let res = await axios.head(url)
      mime = res.headers['content-type']
      if (mime.split("/")[1] === "gif") {
     return SzBotInc.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options}, { quoted: quoted, ...options})
      }
      let type = mime.split("/")[0]+"Message"
      if(mime === "application/pdf"){
     return SzBotInc.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options}, { quoted: quoted, ...options })
      }
      if(mime.split("/")[0] === "image"){
     return SzBotInc.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options}, { quoted: quoted, ...options})
      }
      if(mime.split("/")[0] === "video"){
     return SzBotInc.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options}, { quoted: quoted, ...options })
      }
      if(mime.split("/")[0] === "audio"){
     return SzBotInc.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options}, { quoted: quoted, ...options })
      }
      }
      
      /**
     * 
     * @param {*} jid 
     * @param {*} name 
     * @param [*] values 
     * @returns 
     */
    SzBotInc.sendPoll = (jid, name = '', values = [], selectableCount = 1) => { return SzBotInc.sendMessage(jid, { poll: { name, values, selectableCount }}) }

return SzBotInc

}

SzBotIncBot()

process.on('uncaughtException', function (err) {
console.log('Caught exception: ', err)
})
