<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a1a; padding: 30px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #c84b11; padding-bottom: 16px; margin-bottom: 20px; }
  .company-name { font-size: 18px; font-weight: bold; color: #c84b11; }
  .company-sub { font-size: 10px; color: #555; margin-top: 2px; }
  .doc-title { text-align: right; }
  .doc-title h1 { font-size: 16px; font-weight: bold; color: #c84b11; letter-spacing: 1px; }
  .doc-title .doc-no { font-size: 10px; color: #555; margin-top: 4px; }
  .parties { display: flex; gap: 30px; margin-bottom: 20px; }
  .party-box { flex: 1; border: 1px solid #ddd; padding: 12px; border-radius: 4px; background: #fafafa; }
  .party-box h4 { font-size: 9px; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 6px; }
  .party-box .name { font-weight: bold; font-size: 12px; }
  .party-box p { font-size: 10px; color: #444; margin-top: 2px; line-height: 1.5; }
  .shipment-info { display: flex; gap: 16px; margin-bottom: 20px; }
  .info-box { flex: 1; background: #fff7f4; border: 1px solid #f0c5aa; padding: 10px; border-radius: 4px; }
  .info-box .label { font-size: 9px; text-transform: uppercase; color: #888; letter-spacing: 1px; }
  .info-box .value { font-weight: bold; font-size: 11px; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead tr { background: #c84b11; color: white; }
  thead th { padding: 8px 10px; text-align: left; font-size: 10px; font-weight: bold; }
  tbody tr { border-bottom: 1px solid #eee; }
  tbody tr:nth-child(even) { background: #fafafa; }
  tbody td { padding: 8px 10px; font-size: 10px; }
  .text-right { text-align: right; }
  .totals { margin-left: auto; width: 280px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
  .totals tr td { padding: 6px 12px; font-size: 10px; }
  .totals tr:last-child { background: #c84b11; color: white; font-weight: bold; font-size: 12px; }
  .totals tr:not(:last-child) td { border-bottom: 1px solid #eee; }
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
    <h1>COMMERCIAL INVOICE</h1>
    <div class="doc-no">No: CI/{{ $shipment->po_number }}/{{ date('Y') }}</div>
    <div class="doc-no">Date: {{ date('d F Y') }}</div>
  </div>
</div>

<div class="parties">
  <div class="party-box">
    <h4>Seller / Exporter</h4>
    <div class="name">PT METINCA PRIMA</div>
    <p>Jl. Industri Ekspor No. 1<br>Indonesia</p>
  </div>
  <div class="party-box">
    <h4>Buyer / Consignee</h4>
    <div class="name">{{ $shipment->customer->name }}</div>
    <p>
      {{ $shipment->customer->address ?? '-' }}<br>
      {{ $shipment->customer->country ?? '-' }}<br>
      @if($shipment->customer->tax_id) Tax ID: {{ $shipment->customer->tax_id }} @endif
    </p>
  </div>
</div>

<div class="shipment-info">
  <div class="info-box">
    <div class="label">PO Number</div>
    <div class="value">{{ $shipment->po_number }}</div>
  </div>
  <div class="info-box">
    <div class="label">Incoterms</div>
    <div class="value">{{ $shipment->incoterms ?? 'FOB' }}</div>
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
</div>

<table>
  <thead>
    <tr>
      <th style="width:5%">No.</th>
      <th style="width:40%">Description of Goods</th>
      <th style="width:12%">HS Code</th>
      <th style="width:12%" class="text-right">Quantity</th>
      <th style="width:15%" class="text-right">Unit Price</th>
      <th style="width:16%" class="text-right">Total Amount</th>
    </tr>
  </thead>
  <tbody>
    @php $grandTotal = 0; $currency = 'USD'; @endphp
    @foreach($shipment->shipmentItems as $i => $item)
    @php
      $total = $item->qty * $item->unit_price;
      $grandTotal += $total;
      $currency = $item->currency ?? 'USD';
    @endphp
    <tr>
      <td>{{ $i + 1 }}</td>
      <td>{{ $item->description }}</td>
      <td>{{ $item->hs_code ?? '-' }}</td>
      <td class="text-right">{{ number_format($item->qty) }}</td>
      <td class="text-right">{{ $currency }} {{ number_format($item->unit_price, 2) }}</td>
      <td class="text-right">{{ $currency }} {{ number_format($total, 2) }}</td>
    </tr>
    @endforeach
  </tbody>
</table>

<table class="totals">
  <tr>
    <td>Subtotal</td>
    <td class="text-right">{{ $currency }} {{ number_format($grandTotal, 2) }}</td>
  </tr>
  <tr>
    <td>Freight</td>
    <td class="text-right">As per {{ $shipment->incoterms ?? 'FOB' }}</td>
  </tr>
  <tr>
    <td><strong>TOTAL AMOUNT</strong></td>
    <td class="text-right"><strong>{{ $currency }} {{ number_format($grandTotal, 2) }}</strong></td>
  </tr>
</table>

<div class="footer">
  <div>
    <div class="notes">
      <strong>Notes:</strong><br>
      - Payment terms as agreed<br>
      - This document is computer generated and valid without signature unless stated otherwise
    </div>
  </div>
  <div class="signature-box">
    <div class="signature-line">
      Authorized Signature<br>
      PT METINCA PRIMA
    </div>
  </div>
</div>

</body>
</html>
