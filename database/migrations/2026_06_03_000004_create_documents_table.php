<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained('shipments')->onDelete('cascade');
            $table->string('type'); // Commercial Invoice, Packing List, B/L, COO, PEB, etc.
            $table->integer('version')->default(1);
            $table->string('file_name');
            $table->string('file_path');
            $table->string('status')->default('DRAFT'); // DRAFT, IN_REVIEW, APPROVED, REVISED
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
