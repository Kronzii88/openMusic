import dotenv from "dotenv";
dotenv.config();

import amqp from "amqplib";
import nodemailer from "nodemailer";
import PlaylistsService from "./services/postgres/PlaylistsService.js";
import CacheService from "./services/redis/CacheService.js";
import CollaborationsService from "./services/postgres/CollaborationsService.js";
import MailSender from "./services/mail/MailSender.js";
import Listener from "./services/rabbitmq/Listener.js";

// Setup dependencies
// Karena PlaylistsService kita butuh Collab, kita buat instance kosong atau mock jika perlu,
// tapi idealnya Consumer punya akses DB penuh.
const collaborationsService = new CollaborationsService();
const playlistsService = new PlaylistsService(collaborationsService);

// MailSender Class (Internal di consumer atau file terpisah)
class MailSender {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  sendEmail(targetEmail, content) {
    const message = {
      from: "OpenMusic Apps",
      to: targetEmail,
      subject: "Ekspor Playlist Anda",
      text: "Terlampir hasil dari ekspor playlist Anda",
      attachments: [
        {
          filename: "playlist.json",
          content,
        },
      ],
    };
    return this._transporter.sendMail(message);
  }
}

// Listener Class
class Listener {
  constructor(playlistsService, mailSender) {
    this._playlistsService = playlistsService;
    this._mailSender = mailSender;
    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(
        message.content.toString()
      );

      // Ambil data playlist + songs dari DB
      const playlist = await this._playlistsService.getSongsFromPlaylist(
        playlistId
      );

      const result = { playlist };

      await this._mailSender.sendEmail(targetEmail, JSON.stringify(result));
      console.log(`Email sent to ${targetEmail}`);
    } catch (error) {
      console.error(error);
    }
  }
}

const init = async () => {
  const mailSender = new MailSender();
  const listener = new Listener(playlistsService, mailSender);

  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  await channel.assertQueue("export:playlists", { durable: true });
  channel.consume("export:playlists", listener.listen, { noAck: true });
  console.log("Consumer berjalan...");
};

init();
