<?php

namespace App\Services;

use App\Mail\ExportNotificationMail;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public static function notify(int $userId, string $type, string $title, string $message, ?int $shipmentId = null): void
    {
        Notification::create([
            'user_id'     => $userId,
            'type'        => $type,
            'title'       => $title,
            'message'     => $message,
            'shipment_id' => $shipmentId,
            'is_read'     => false,
        ]);

        // Kirim email jika user mengaktifkan notifikasi email
        $user = User::find($userId);
        if ($user && $user->email_notifications) {
            try {
                Mail::to($user->email)->queue(
                    new ExportNotificationMail($title, $message, $user->name, $shipmentId)
                );
            } catch (\Throwable $e) {
                // Jangan batalkan proses utama jika email gagal
                \Log::warning('Gagal mengirim email notifikasi ke ' . $user->email . ': ' . $e->getMessage());
            }
        }
    }

    public static function notifyRole(string $role, string $type, string $title, string $message, ?int $shipmentId = null): void
    {
        $users = User::where('role', $role)->where('is_active', true)->get();
        foreach ($users as $user) {
            self::notify($user->id, $type, $title, $message, $shipmentId);
        }
    }
}
