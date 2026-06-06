<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roles = [
            ['name' => 'System Admin', 'email' => 'admin@metinca.com', 'role' => 'admin'],
            ['name' => 'Sales', 'email' => 'sales@metinca.com', 'role' => 'sales'],
            ['name' => 'Staff Export Specialist', 'email' => 'staff@metinca.com', 'role' => 'export_staff'],
            ['name' => 'Export Manager Approver', 'email' => 'manager@metinca.com', 'role' => 'export_manager'],
            ['name' => 'Finance Controller', 'email' => 'finance@metinca.com', 'role' => 'finance'],
            ['name' => 'Internal Forwarder operator', 'email' => 'forwarder@metinca.com', 'role' => 'forwarder'],
        ];

        foreach ($roles as $r) {
            User::factory()->create([
                'name' => $r['name'],
                'email' => $r['email'],
                'password' => bcrypt('password'),
                'role' => $r['role'],
                'is_active' => true,
            ]);
        }

        $this->call([
            CustomerSeeder::class,
            ShipmentSeeder::class,
        ]);
    }
}
