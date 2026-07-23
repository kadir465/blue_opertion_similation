import { exec, spawn } from 'child_process';
import path from 'path';

// Commands to try in order of preference
const commands = ['python', 'python3', 'py'];

function freePortAndStart(port) {
  if (process.platform === 'win32') {
    const findCmd = `netstat -ano | findstr :${port}`;
    exec(findCmd, (err, stdout) => {
      if (!stdout) {
        // Port is already free
        return startService(0);
      }

      const lines = stdout.trim().split('\n');
      const pids = lines.map(line => {
        const parts = line.trim().split(/\s+/);
        return parts[parts.length - 1];
      }).filter(pid => pid && pid !== '0');

      const uniquePids = [...new Set(pids)];

      if (uniquePids.length === 0) {
        return startService(0);
      }

      console.log(`[AI Loader] Port ${port} üzerinde çalışan eski süreçler bulundu (PID: ${uniquePids.join(', ')}). Temizleniyor...`);
      
      let killedCount = 0;
      uniquePids.forEach(pid => {
        exec(`taskkill /F /PID ${pid}`, () => {
          killedCount++;
          if (killedCount === uniquePids.length) {
            console.log(`[AI Loader] Port ${port} başarıyla temizlendi.`);
            // Give the OS 1 second to release the socket
            setTimeout(() => startService(0), 1000);
          }
        });
      });
    });
  } else {
    // Non-Windows system, just try starting
    startService(0);
  }
}

function startService(index) {
  if (index >= commands.length) {
    console.error('\n======================================================');
    console.error('HATA: Python veya gerekli paketler bulunamadı!');
    console.error('Lütfen şunları kontrol edin:');
    console.error('1. Bilgisayarınızda Python yüklü olduğundan emin olun.');
    console.error('2. PATH çevre değişkenlerine Python\'ın eklendiğinden emin olun.');
    console.error('3. "pip install -r intent_service/requirements.txt" komutunu çalıştırın.');
    console.error('======================================================\n');
    process.exit(1);
  }

  const cmd = commands[index];
  console.log(`[AI Loader] Python servisi başlatılıyor (${cmd})...`);

  const child = spawn(cmd, ['-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', '8000'], {
    cwd: path.resolve('intent_service'),
    shell: true,
    stdio: 'pipe'
  });

  let hasStarted = false;

  child.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(`[AI Service] ${output}`);
    if (output.includes('Application startup complete') || output.includes('Uvicorn running')) {
      hasStarted = true;
    }
  });

  child.stderr.on('data', (data) => {
    const output = data.toString();
    process.stderr.write(`[AI Error] ${output}`);
    
    if (output.includes('Application startup complete') || output.includes('Uvicorn running')) {
      hasStarted = true;
    }
    
    if (output.includes('ModuleNotFoundError') || output.includes('No module named')) {
      console.warn(`[AI Loader] Gerekli paketler ${cmd} ile bulunamadı, sıradaki deneniyor...`);
      child.kill();
    }
  });

  child.on('error', () => {
    console.warn(`[AI Loader] ${cmd} komutu bulunamadı, sıradaki deneniyor...`);
    startService(index + 1);
  });

  child.on('exit', (code) => {
    if (!hasStarted && (code !== 0 && code !== null)) {
      console.warn(`[AI Loader] ${cmd} ile başlatma başarısız oldu (Çıkış kodu: ${code}). Sıradaki deneniyor...`);
      startService(index + 1);
    } else if (code !== 0 && code !== null) {
      console.error(`[AI Service] Sunucu beklenmedik şekilde kapandı (Çıkış kodu: ${code}).`);
      process.exit(code);
    }
  });
}

// Start by freeing port 8000
freePortAndStart(8000);
