'use client';

import AppShell from '@/components/layout/AppShell';
import { PricingPlans } from '@/components/credits/PricingPlans';

export default function PricingPage() {
    return (
        <AppShell>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
                <PricingPlans />
            </div>
        </AppShell>
    );
}
