import express from "express";
import "dotenv/config";
import morgan from "morgan";
import bodyParser from "body-parser";
import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import dayjs from "dayjs";
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const server = express();

server.use(morgan("dev"));
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

const levels = {
  fatal: 0xff2222,
  error: 0xff3a3a,
  warning: 0xfaff13,
  info: 0x215fff,
};

const icons = {
  fatal: "🎇",
  error: "🔥",
  warning: "⛔️",
  info: "💬",
};

server.use("/", (req, _, next) => {
  const { exception, title, datetime, web_url, location, user, level } =
    req.body.data.event;
  const [date, time] = dayjs(datetime.replaceAll("T", " ").split(".")[0])
    .add(9, "hour")
    .format("YYYY-MM-DD,HH:mm:ss")
    .split(",");
  const error = new EmbedBuilder()
    .setColor(levels[level])
    .setTitle(`${icons[level]} ${title}`)
    .setURL(web_url)
    .setDescription(exception?.values[0]?.value || "상세 설명 없음")
    .addFields(
      { name: "발생일자", value: date, inline: true },
      { name: "발생시간", value: time.split(".")[0], inline: true },
      {
        name: "사용자",
        value: user.username || "사용자 알 수 없음",
        inline: true,
      }
    )
    .setFooter({ text: location || "경로 알 수 없음" });
  client.channels.cache
    .get(process.env.DISCORD_CHANNEL_ID)
    .send({ embeds: [error] });
  next();
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_BOT_TOKEN);

server.listen(process.env.PORT, () => console.log("서버가 켜졌습니다"));
