<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained('shipments')->onDelete('cascade');
            $table->string('vendor_name');
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('IDR');
            $table->string('status')->default('UNPAID'); // UNPAID, PARTIAL, PAID, HOLD
            $table->string('proof_path')->nullable(); // Upload bukti bayar
            $table->string('invoice_path')->nullable(); // Upload invoice
            $table->foreignId('validated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('comment')->nullable(); // Catatan hold
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
