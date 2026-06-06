<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function preview(Document $document)
    {
        $user = auth()->user();
        if ($user->role === 'sales' && $document->shipment->sales_id !== $user->id) {
            abort(403, 'Unauthorized.');
        }

        $path = $document->file_path;
        if (!Storage::disk('public')->exists($path)) {
            abort(404, 'File not found.');
        }

        $file = Storage::disk('public')->get($path);
        $mime = Storage::disk('public')->mimeType($path);

        return response($file, 200)
            ->header('Content-Type', $mime)
            ->header('Content-Disposition', 'inline; filename="' . $document->file_name . '"');
    }

    public function download(Document $document)
    {
        $user = auth()->user();
        if ($user->role === 'sales' && $document->shipment->sales_id !== $user->id) {
            abort(403, 'Unauthorized.');
        }

        $path = $document->file_path;
        if (!Storage::disk('public')->exists($path)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('public')->download($path, $document->file_name);
    }
}
