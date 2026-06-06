<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    use LogsActivity;

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'address' => 'nullable|string',
            'tax_id' => 'nullable|string|max:255',
            'contact' => 'nullable|string|max:255',
        ]);

        $customer = Customer::create($validated);

        $this->logAudit('CREATE_CUSTOMER', 'Customer', $customer->id, [
            'name' => $customer->name,
            'detail' => 'Customer baru ' . $customer->name . ' didaftarkan.',
        ]);

        return redirect()->back()->with('success', 'Customer created successfully.');
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'address' => 'nullable|string',
            'tax_id' => 'nullable|string|max:255',
            'contact' => 'nullable|string|max:255',
        ]);

        $customer->update($validated);

        $this->logAudit('UPDATE_CUSTOMER', 'Customer', $customer->id, [
            'name' => $customer->name,
            'detail' => 'Informasi customer ' . $customer->name . ' diperbarui.',
        ]);

        return redirect()->back()->with('success', 'Customer updated successfully.');
    }
}
