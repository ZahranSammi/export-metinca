<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        Customer::create([
            'name' => 'Metinca global corp',
            'country' => 'Singapore',
            'address' => '10 Marina Boulevard, Singapore',
            'tax_id' => 'SG-98127398',
            'contact' => 'John Doe (+65 9123 4567)',
        ]);

        Customer::create([
            'name' => 'Tokyo Industry K.K.',
            'country' => 'Japan',
            'address' => 'Chiyoda-ku, Tokyo 100-0001',
            'tax_id' => 'JP-88273981',
            'contact' => 'Kenji Sato (+81 3 5555 0199)',
        ]);
    }
}
