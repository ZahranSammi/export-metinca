<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'po_number',
        'customer_id',
        'sales_id',
        'status',
        'etd',
        'eta',
        'incoterms',
        'po_file_path',
        'port_loading',
        'port_discharge',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function sales(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sales_id');
    }

    public function shipmentItems(): HasMany
    {
        return $this->hasMany(ShipmentItem::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(ShipmentStatusLog::class);
    }

    public function documentRequests(): HasMany
    {
        return $this->hasMany(\App\Models\DocumentRequest::class);
    }
}
