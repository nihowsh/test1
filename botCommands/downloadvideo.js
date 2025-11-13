const { SlashCommandBuilder } = require('discord.js');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB Discord limit (regular servers)

// Safe command execution using spawn with argument arrays (no shell injection)
function spawnPromise(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args);
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });
    
    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function downloadVideo(url, outputPath) {
  // Validate URL format (basic security check)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('Invalid URL: must start with http:// or https://');
  }
  
  const args = [
    '-f', 'bestvideo[filesize<20M]+bestaudio[filesize<5M]/best[filesize<25M]/bestvideo+bestaudio/best',
    '--merge-output-format', 'mp4',
    '--no-warnings',
    '-o', outputPath,
    url
  ];
  
  await spawnPromise('yt-dlp', args);
}

async function getVideoDuration(inputPath) {
  const args = [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    inputPath
  ];
  
  const { stdout } = await spawnPromise('ffprobe', args);
  return parseFloat(stdout.trim());
}

async function compressVideo(inputPath, outputPath, targetSize) {
  const duration = await getVideoDuration(inputPath);
  const targetBitrate = Math.floor((targetSize * 8) / duration / 1000 * 0.9); // 90% margin
  
  const args = [
    '-i', inputPath,
    '-c:v', 'libx264',
    '-b:v', `${targetBitrate}k`,
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    '-y', // Overwrite output file
    outputPath
  ];
  
  await spawnPromise('ffmpeg', args);
}

async function getFileSize(filePath) {
  const stats = await fs.stat(filePath);
  return stats.size;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('downloadvideo')
    .setDescription('Download videos from YouTube, TikTok, Instagram, Redgifs, etc.')
    .addStringOption(option =>
      option.setName('link1')
        .setDescription('Video link 1')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('link2')
        .setDescription('Video link 2')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('link3')
        .setDescription('Video link 3')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('link4')
        .setDescription('Video link 4')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('link5')
        .setDescription('Video link 5')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('link6')
        .setDescription('Video link 6')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('link7')
        .setDescription('Video link 7')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('link8')
        .setDescription('Video link 8')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('link9')
        .setDescription('Video link 9')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('link10')
        .setDescription('Video link 10')
        .setRequired(false)),

  async execute(interaction) {
    const links = [];
    for (let i = 1; i <= 10; i++) {
      const link = interaction.options.getString(`link${i}`);
      if (link) links.push(link);
    }

    if (links.length === 0) {
      return await interaction.reply({
        content: '❌ Please provide at least one video link!',
        ephemeral: true
      });
    }

    await interaction.deferReply();

    const tempDir = path.join(__dirname, '..', 'temp_videos');
    try {
      await fs.mkdir(tempDir, { recursive: true });
    } catch (err) {}

    let successful = 0;
    let failed = 0;
    const results = [];
    const filesToCleanup = [];

    try {
      for (let i = 0; i < links.length; i++) {
        const url = links[i];
        const videoNum = i + 1;
        const timestamp = Date.now();
        const originalPath = path.join(tempDir, `video_${timestamp}_${videoNum}.mp4`);
        const compressedPath = path.join(tempDir, `compressed_${timestamp}_${videoNum}.mp4`);

        try {
          await interaction.editReply({
            content: `⏳ **Processing video ${videoNum}/${links.length}...**\n\nDownloading from: ${url.substring(0, 50)}...`
          });

          // Download video
          await downloadVideo(url, originalPath);
          filesToCleanup.push(originalPath);
          
          let finalPath = originalPath;
          let fileSize = await getFileSize(originalPath);
          let compressed = false;

          // Verify file size before compression
          if (fileSize > MAX_FILE_SIZE) {
            await interaction.editReply({
              content: `⏳ **Processing video ${videoNum}/${links.length}...**\n\nFile too large (${(fileSize / 1024 / 1024).toFixed(1)}MB), compressing...`
            });

            await compressVideo(originalPath, compressedPath, MAX_FILE_SIZE);
            filesToCleanup.push(compressedPath);
            finalPath = compressedPath;
            fileSize = await getFileSize(compressedPath);
            compressed = true;
            
            // Verify compressed file is under limit
            if (fileSize > MAX_FILE_SIZE) {
              throw new Error(`Compressed file still too large: ${(fileSize / 1024 / 1024).toFixed(1)}MB`);
            }
          }

          // Final size check before upload
          if (fileSize > MAX_FILE_SIZE) {
            throw new Error(`File size ${(fileSize / 1024 / 1024).toFixed(1)}MB exceeds Discord limit`);
          }

          // Send video
          const sizeInMB = (fileSize / 1024 / 1024).toFixed(1);
          const compressNote = compressed ? ' (compressed)' : '';
          
          await interaction.followUp({
            content: `✅ **Video ${videoNum}** - ${sizeInMB}MB${compressNote}`,
            files: [finalPath]
          });

          successful++;
          results.push(`✅ Video ${videoNum}`);

        } catch (error) {
          console.error(`Download error for video ${videoNum}:`, error);
          failed++;
          results.push(`❌ Video ${videoNum}: ${error.message.substring(0, 50)}`);
        }
      }

      // Final summary
      await interaction.editReply({
        content: `🎬 **Download Complete!**\n\n✅ Successful: **${successful}**\n❌ Failed: **${failed}**\n\n${results.join('\n')}`,
      });

    } finally {
      // Always clean up temp files
      for (const file of filesToCleanup) {
        try {
          await fs.unlink(file);
        } catch (err) {
          console.error(`Failed to delete ${file}:`, err);
        }
      }
      
      // Clean up temp directory
      try {
        const files = await fs.readdir(tempDir);
        for (const file of files) {
          await fs.unlink(path.join(tempDir, file)).catch(() => {});
        }
        await fs.rmdir(tempDir).catch(() => {});
      } catch (err) {}
    }
  },
};
