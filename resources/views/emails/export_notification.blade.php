<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
  .header { background: #c84b11; padding: 24px 30px; }
  .header h1 { margin: 0; color: #fff; font-size: 18px; letter-spacing: .5px; }
  .header p { margin: 4px 0 0; color: rgba(255,255,255,.8); font-size: 12px; }
  .body { padding: 28px 30px; }
  .greeting { font-size: 14px; color: #333; margin-bottom: 14px; }
  .message-box { background: #fff7f4; border-left: 4px solid #c84b11; padding: 14px 16px; border-radius: 4px; font-size: 13px; color: #444; line-height: 1.6; }
  .cta { margin: 22px 0; text-align: center; }
  .cta a { background: #c84b11; color: #fff; text-decoration: none; padding: 10px 28px; border-radius: 4px; font-size: 13px; font-weight: bold; }
  .footer { padding: 16px 30px; border-top: 1px solid #eee; font-size: 11px; color: #999; text-align: center; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>PT Metinca Prima — Export System</h1>
    <p>Notifikasi Otomatis Sistem Manajemen Ekspor</p>
  </div>
  <div class="body">
    <div class="greeting">Halo, <strong>{{ $recipientName }}</strong>,</div>
    <div class="message-box">
      <strong>{{ $title }}</strong><br><br>
      {{ $message }}
    </div>
    @if($shipmentId)
    <div class="cta">
      <a href="{{ config('app.url') }}/dashboard">Buka Dashboard →</a>
    </div>
    @endif
    <p style="font-size:11px;color:#999;margin-top:20px;">
      Email ini dikirim karena Anda mengaktifkan notifikasi email di pengaturan akun.<br>
      Untuk menonaktifkan, masuk ke <strong>Profil → Pengaturan Notifikasi</strong>.
    </p>
  </div>
  <div class="footer">
    &copy; {{ date('Y') }} PT Metinca Prima &mdash; Export Management System
  </div>
</div>
</body>
</html>
