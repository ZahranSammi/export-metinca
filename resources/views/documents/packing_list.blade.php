<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a1a; padding: 30px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0d6efd; padding-bottom: 16px; margin-bottom: 20px; }
  .company-name { font-size: 18px; font-weight: bold; color: #0d6efd; }
  .company-sub { font-size: 10px; color: #555; margin-top: 2px; }
  .doc-title { text-align: right; }
  .doc-title h1 { font-size: 16px; font-weight: bold; color: #0d6efd; letter-spacing: 1px; }
  .doc-title .doc-no { font-size: 10px; color: #555; margin-top: 4px; }
  .parties { display: flex; gap: 30px; margin-bottom: 20px; }
  .party-box { flex: 1; border: 1px solid #ddd; padding: 12px; border-radius: 4px; background: #fafafa; }
  .party-box h4 { font-size: 9px; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 6px; }
  .party-box .name { font-weight: bold; font-size: 12px; }
  .party-box p { font-size: 10px; color: #444; margin-top: 2px; line-height: 1.5; }
  .shipment-info { display: flex; gap: 16px; margin-bottom: 20px; }
  .info-box { flex: 1; background: #f0f5ff; border: 1px solid #bcd0f7; padding: 10px; border-radius: 4px; }
  .info-box .label { font-size: 9px; text-transform: uppercase; color: #888; letter-spacing: 1px; }
  .info-box .value { font-weight: bold; font-size: 11px; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead tr { background: #0d6efd; color: white; }
  thead th { padding: 8px 10px; text-align: left; font-size: 10px; font-weight: bold; }
  tbody tr { border-bottom: 1px solid #eee; }
  tbody tr:nth-child(even) { background: #f5f8ff; }
  tbody td { padding: 8px 10px; font-size: 10px; }
  .text-right { text-align: right; }
  .text-center { text-align: center; }
  tfoot tr { background: #0d6efd; color: white; font-weight: bold; }
  tfoot td { padding: 8px 10px; font-size: 10px; }
  .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 16px; display: flex; justify-content: space-between; }
  .signature-box { width: 200px; text-align: center; }
  .signature-line { border-top: 1px solid #555; margin-top: 50px; padding-top: 6px; font-size: 10px; color: #555; }
  .notes { font-size: 9px; color: #888; margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 10px; }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="company-name">PT METINCA PRIMA</div>
    <div class="company-sub">Export & International Trade</div>
  </div>
  <div class="doc-title">
    <h1>PACKING LIST</h1>
    <div class="doc-no">No: PL/{{ $shipment->po_number }}/{{ date('Y') }}</div>
    <div class="doc-no">Date: {{ date('d F Y') }}</div>
  </div>
</div>

<div class="parties">
  <div class="party-box">
    <h4>Shipper / Exporter</h4>
    <div class="name">PT METINCA PRIMA</div>
    <p>Jl. Industri Ekspor No. 1<br>Indonesia</p>
  </div>
  <div class="party-box">
    <h4>Consignee</h4>
    <div class="name">{{ $shipment->customer->name }}</div>
    <p>
      {{ $shipment->customer->address ?? '-' }}<br>
      {{ $shipment->customer->country ?? '-' }}
    </p>
  </div>
</div>

<div class="shipment-info">
  <div class="info-box">
    <div class="label">PO Number</div>
    <div class="value">{{ $shipment->po_number }}</div>
  </div>
  <div class="info-box">
    <div class="label">Port of Loading</div>
    <div class="value">{{ $shipment->port_loading ?? '-' }}</div>
  </div>
  <div class="info-box">
    <div class="label">Port of Discharge</div>
    <div class="value">{{ $shipment->port_discharge ?? '-' }}</div>
  </div>
  <div class="info-box">
    <div class="label">ETD</div>
    <div class="value">{{ $shipment->etd ? \Carbon\Carbon::parse($shipment->etd)->format('d M Y') : '-' }}</div>
  </div>
  <div class="info-box">
    <div class="label">ETA</div>
    <div class="value">{{ $shipment->eta ? \Carbon\Carbon::parse($shipment->eta)->format('d M Y') : '-' }}</div>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th style="width:5%">No.</th>
      <th style="width:38%">Description of Goods</th>
      <th style="width:12%">HS Code</th>
      <th style="width:12%" class="text-right">Quantity</th>
      <th style="width:10%" class="text-center">No. of Pkgs</th>
      <th style="width:12%" class="text-right">Net Weight (kg)</th>
      <th style="width:11%" class="text-right">Gross Weight (kg)</th>
    </tr>
  </thead>
  <tbody>
    @php $totalQty = 0; @endphp
    @foreach($shipment->shipmentItems as $i => $item)
    @php $totalQty += $item->qty; @endphp
    <tr>
      <td>{{ $i + 1 }}</td>
      <td>{{ $item->description }}</td>
      <td>{{ $item->hs_code ?? '-' }}</td>
      <td class="text-right">{{ number_format($item->qty) }}</td>
      <td class="text-center">{{ ceil($item->qty / 10) }}</td>
      <td class="text-right">-</td>
      <td class="text-right">-</td>
    </tr>
    @endforeach
  </tbody>
  <tfoot>
    <tr>
      <td colspan="3"><strong>TOTAL</strong></td>
      <td class="text-right"><strong>{{ number_format($totalQty) }}</strong></td>
      <td class="text-center"><strong>{{ ceil($totalQty / 10) }}</strong></td>
      <td class="text-right">-</td>
      <td class="text-right">-</td>
    </tr>
  </tfoot>
</table>

<div class="footer">
  <div>
    <div class="notes">
      <strong>Notes:</strong><br>
      - Net weight and gross weight to be confirmed upon final packing<br>
      - This document is generated from export management system PT Metinca Prima
    </div>
  </div>
  <div class="signature-box">
    <div class="signature-line">
      Prepared by<br>
      PT METINCA PRIMA
    </div>
  </div>
</div>

</body>
</html>
