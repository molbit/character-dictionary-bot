require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { getHeroes } = require('./sheets');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = 'A1:J100';

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    // スラッシュコマンド登録
    const commands = [
        new SlashCommandBuilder()
            .setName('search')
            .setDescription('英雄ステータスを検索')
            .addStringOption(option => option.setName('name').setDescription('英雄名').setRequired(true))
            .toJSON()
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'search') {
        const name = interaction.options.getString('name');
        const heroes = await getHeroes(SPREADSHEET_ID, RANGE);

        // 部分一致検索対応
        const hero = heroes.find(h => h['名前'].includes(name));

        if (!hero) return interaction.reply(`${name} は見つかりませんでした。`);

        // 簡易評価アイコン
        const evalIcon = value => {
            const num = parseInt(value);
            if (num >= 90) return '💪';
            if (num >= 75) return '⚔️';
            if (num >= 60) return '🛡️';
            return '';
        };

        const embed = new EmbedBuilder()
            .setTitle(`${hero['名前']} のステータス`)
            .setColor(0x00ff00)
            .addFields(
                { name: '武力', value: `${hero['武力']} ${evalIcon(hero['武力'])}`, inline: true },
                { name: '知力', value: `${hero['知力']} ${evalIcon(hero['知力'])}`, inline: true },
                { name: '統率', value: `${hero['統率']} ${evalIcon(hero['統率'])}`, inline: true },
                { name: '魅力', value: hero['魅力'], inline: true },
                { name: '天賦', value: hero['天賦'], inline: true },
                { name: '覚醒', value: hero['覚醒'], inline: true },
            )
            .addFields(
                { name: '輪廻', value: hero['輪廻'], inline: true },
                { name: '宿命', value: hero['宿命'], inline: true },
                { name: '兵種', value: hero['兵種'], inline: true },
            );

        interaction.reply({ embeds: [embed] });
    }
});


client.login(process.env.TOKEN);
