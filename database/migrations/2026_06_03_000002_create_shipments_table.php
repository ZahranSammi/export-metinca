<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->string('po_number')->unique();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('sales_id')->constrained('users')->onDelete('cascade');
            $table->string('status')->default('DRAFT'); // DRAFT, SENT_TO_EXPORT, IN_PROGRESS, IN_REVIEW, APPROVED, PAYMENT_VERIFIED, SENT_TO_FORWARDER, IN_CUSTOMS, SHIPPED, DELIVERED, ARCHIVED
            $table->date('etd')->nullable();
            $table->date('eta')->nullable();
            $table->string('incoterms')->nullable(); // FOB, CIF, EXW, dsb.
            $table->string('port_loading')->nullable();
            $table->string('port_discharge')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
