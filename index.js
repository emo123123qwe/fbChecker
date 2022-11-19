const fs = require('fs');
const axios = require('axios');
const cookiefile = require('cookiefile');
const path = require('path')



// функция котрая принимает в себя куки, делает запрос в фб -> возвращает страницу, с которой я сплитом вырезаю iD рекламного кабинета
async function getActID(cookies) {
    await axios({
        method: 'get',
        url: "https://www.facebook.com/adsmanager/manage/campaigns?",
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
            'Cookie' : cookies,
            'Referer' : 'https://www.facebook.com/',
            'authority' : 'www.facebook.com',
            'Accept' : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Encoding' : 'gzip, deflate, br',
            'Accept-Language' : 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control' : 'max-age=0',
            'sec-ch-ua' : `"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"`,
            'sec-ch-ua-platform' : '"Windows"',
            'sec-ch-ua-mobile' : '?0',
            'sec-fetch-dest' : 'document',
            'sec-fetch-mode' : 'navigate',
            'sec-fetch-site' : 'same-origin',
            'sec-fetch-user' : '?1',
            'upgrade-insecure-requests' : 1,
            'viewport-width' : 1680
        }
    })
    .then((response) => {
        if (response.data.includes('act=') == true ) {
            let string1 = response.data.split("act=")
            let string2 = string1[1].split('");')
            actID = string2[0]
        } else {
            console.log('куки не валид..');
        }
    })
    return actID
}


let filePath = 'file_1'

async function qwe() {
    //читаю папку с логами
    for (const logEntry of fs.readdirSync(`./logs/${filePath}`)) {
        // переменная для проверки валидности пути (validationPath: ./logs/log1/Cookies.)
        let validationPath = `./logs/${filePath}/${logEntry}/Cookies`

        await fs.exists(validationPath, async (exists) => {

            if(exists == true) {
                //если нашли папку Cookies, читаю че там находится 
                for (const cookieEntry of fs.readdirSync(validationPath)) {

                    if (cookieEntry.toLowerCase().endsWith('.txt')) {

                        //если нашел в папке файл .тхт, это куки
                        //записываю их в переменную, чтобы отрезать лишние строки и оставить только .facebook
                        let cookieIN = await fs.readFileSync(`${validationPath}/${cookieEntry}`, 'utf-8')
                        let lines = cookieIN.split("\n"),
                        FBstrings = [];

                        for (const line of lines) {
                            if (line && line.startsWith(".facebook.com")) FBstrings.push(line);
                        }

                        stringWithFBOnly = FBstrings.join("\n");
                        
                        //проверяю что куки фб есть.
                        if (stringWithFBOnly.length > 0) {

                            //если куки (строки .facebook есть) -> записываю в файл, чтобы с netscape переобразовать в сроку, нужную для запроса
                            await fs.writeFileSync("OnlyFBcookies.txt", stringWithFBOnly,  'utf-8')

                            const cookiemap = new cookiefile.CookieMap('./OnlyFBcookies.txt')
                            cookies = await cookiemap.toRequestHeader().replace ('Cookie: ','')

                            //вызываю функицю которая делает запрос в фб с кукамии и возвращает iD рекламного кабинета
                            let actID = await getActID(cookies)
                            console.log(actID, cookieEntry);
                        }
                    }
                }

            }
        })
    }
}


qwe()
