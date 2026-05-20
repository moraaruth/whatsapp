import { useState, useEffect } from 'react';
import Shell from '../components/layout/Shell';
import { mpesaService } from '../services/mpesaService';
import { formatCurrency, formatDate } from '../lib/utils';
import { Check, Zap, Shield, CreditCard, Phone, ArrowRight, Sparkles } from 'lucide-react';

const plans = [
  {
    id: 'BASIC',
    name: 'Basic',
    price: 1000,
    description: 'Perfect for solo agents',
    features: ['Up to 500 leads/month', 'WhatsApp integration', 'Basic analytics', '1 user', 'Email support'],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 1500,
    description: 'For growing teams',
    popular: true,
    features: ['Up to 2,000 leads/month', 'WhatsApp integration', 'Advanced analytics', '3 users', 'Priority support', 'Follow-up reminders'],
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 3000,
    description: 'For large businesses',
    features: ['Unlimited leads', 'WhatsApp integration', 'Advanced analytics', 'Unlimited users', 'Priority support', 'API access', 'Custom integrations'],
  },
];

export default function Subscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [stkSent, setStkSent] = useState(false);

  useEffect(() => {
    mpesaService.getSubscriptionStatus()
      .then(res => setSubscription(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (plan) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.phoneNumber) {
      alert('Please update your phone number in profile settings first.');
      return;
    }

    setPaying(plan.id);
    try {
      await mpesaService.initiatePayment({
        phoneNumber: user.phoneNumber,
        amount: plan.price,
        plan: plan.id,
      });
      setStkSent(true);
    } catch (e) {
      alert(e.message || 'Payment failed. Try again.');
    } finally {
      setPaying(null);
    }
  };

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-text-primary">Billing & Subscription</h1>
          <p className="text-sm text-text-muted mt-0.5">Manage your plan and payments</p>
        </div>

        {/* Current Plan */}
        {!loading && subscription && (
          <div className={`bg-surface border rounded-2xl p-5 ${
            subscription.isActive ? 'border-accent/30 bg-accent/5' : 'border-border'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  subscription.isActive ? 'bg-accent/20 text-accent' : 'bg-surface-2 text-text-muted'
                }`}>
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {subscription.plan} Plan
                    {subscription.isActive && (
                      <span className="ml-2 badge badge-closed">Active</span>
                    )}
                    {subscription.isTrial && (
                      <span className="ml-2 badge badge-contacted">Trial</span>
                    )}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {subscription.isActive
                      ? `Renews ${formatDate(subscription.endDate)}`
                      : subscription.isTrial
                        ? `Trial ends ${formatDate(subscription.trialEndsAt)}`
                        : 'No active subscription'}
                  </p>
                </div>
              </div>
              <p className="text-lg font-bold text-text-primary">
                {formatCurrency(subscription.monthlyPrice || 0)}<span className="text-xs text-text-muted font-normal">/mo</span>
              </p>
            </div>
          </div>
        )}

        {/* STK Sent Confirmation */}
        {stkSent && (
          <div className="bg-whatsapp/10 border border-whatsapp/20 rounded-2xl p-5 flex items-start gap-3">
            <div className="w-8 h-8 bg-whatsapp/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone size={16} className="text-whatsapp" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">M-Pesa prompt sent!</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Check your phone for the M-Pesa STK push. Enter your PIN to complete payment.
                Your subscription will activate automatically.
              </p>
            </div>
          </div>
        )}

        {/* Plans */}
        <div>
          <h2 className="text-sm font-semibold text-text-primary mb-4">Choose a Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`bg-surface border rounded-2xl p-5 flex flex-col relative transition-all duration-200 ${
                  plan.popular
                    ? 'border-accent/40 bg-accent/5'
                    : 'border-border hover:border-border-light'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-white text-2xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles size={10} />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-sm font-bold text-text-primary">{plan.name}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{plan.description}</p>
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-bold text-text-primary">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-xs text-text-muted">/month</span>
                </div>

                <ul className="space-y-2.5 flex-1 mb-5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-success/10 border border-success/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={9} className="text-success" />
                      </div>
                      <span className="text-xs text-text-secondary">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={paying === plan.id || subscription?.isActive}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-accent hover:bg-accent-hover text-white disabled:opacity-50'
                      : 'bg-surface-2 hover:bg-surface-3 text-text-primary border border-border hover:border-border-light disabled:opacity-50'
                  }`}
                >
                  {paying === plan.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      Sending prompt...
                    </>
                  ) : (
                    <>
                      <CreditCard size={14} />
                      Pay with M-Pesa
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* M-Pesa Info */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Zap size={15} className="text-accent" />
            How M-Pesa Payment Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Choose Plan', desc: 'Select the plan that fits your business' },
              { step: '2', title: 'STK Push', desc: 'You receive an M-Pesa prompt on your phone' },
              { step: '3', title: 'Enter PIN', desc: 'Enter your M-Pesa PIN to complete payment' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center text-accent text-xs font-bold flex-shrink-0">
                  {step}
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">{title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
