<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained('shipments')->onDelete('cascade');
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade'); // export_staff
            $table->foreignId('sales_id')->constrained('users')->onDelete('cascade');     // target sales
            $table->string('document_type');      // e.g. "Surat Keterangan Asal", "Data Teknis Barang"
            $table->text('message')->nullable();  // Pesan/instruksi dari Staff ke Sales
            $table->string('status')->default('PENDING'); // PENDING, FULFILLED
            $table->timestamp('fulfilled_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_requests');
    }
};
