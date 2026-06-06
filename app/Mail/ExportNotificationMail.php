<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ExportNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $title,
        public readonly string $message,
        public readonly string $recipientName,
        public readonly ?int $shipmentId = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[PT Metinca Export] ' . $this->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.export_notification',
        );
    }
}
