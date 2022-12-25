const { promises: fs } = require("fs");
require("dotenv").config();
const Envato = require("envato");
const TelegramBot = require("node-telegram-bot-api");
const moment = require("moment");
const bot = new TelegramBot(process.env.TOKEN_TELEGRAM, { polling: true });
var CronJob = require("cron").CronJob;
const client = new Envato.Client({
  token: process.env.TOKEN_ENVATO,
  http: {
    timeout: 30000,
    compression: false,
  },
});

async function checkSale() {
  try {
    const sales = await client.private.getSales();
    const saleLastApi = sales[0];
    const saleLastInFile = JSON.parse(await fs.readFile("sale.json", "utf8"));
    if (
      saleLastInFile &&
      moment(saleLastApi.sold_at).diff(moment(saleLastInFile.sold_at)) > 0
    ) {
      const mess = `Mới bán được item: ${
        saleLastApi["item"]["name"]
      } lúc ${saleLastApi.sold_at.toLocaleString()}`;
      bot.sendMessage(process.env.CHATID, mess);
      await fs.writeFile(
        "sale.json",
        JSON.stringify(saleLastApi),
        function (err) {
          if (err) throw err;
          console.log("complete");
        }
      );
    }
    return true;
  } catch (error) {
    console.log("error: " + error);
  }
}

const job = new CronJob(
  "* * * * *",
  async () => {
    console.log(`Kiểm tra sale lúc ${moment().toISOString()}`);
    await checkSale().catch(console.error);
  },
  null,
  true,
  "Asia/Ho_Chi_Minh"
);

job.start();
