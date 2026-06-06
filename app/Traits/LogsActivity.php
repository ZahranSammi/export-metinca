<?php

namespace App\Traits;

use App\Models\AuditLog;
use App\Models\ShipmentStatusLog;

trait LogsActivity
{
    protected function logStatusChange($shipmentId, $status, $note = null)
    {
        ShipmentStatusLog::create([
            'shipment_id' => $shipmentId,
            'status' => $status,
            'changed_by' => auth()->id(),
            'note' => $note,
        ]);
    }

    protected function logAudit($action, $entity = null, $entityId = null, array $payload = [])
    {
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'entity' => $entity,
            'entity_id' => $entityId,
            'payload' => $payload,
        ]);
    }
}
