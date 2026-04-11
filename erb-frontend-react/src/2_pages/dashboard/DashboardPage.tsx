import { useState } from 'react';
import { LiveManifest } from '../../3_widgets/live-manifest/LiveManifest';
import { CapacityOverview } from '../../3_widgets/capacity-overview/CapacityOverview';
import { CreateShipmentModal } from '../../4_features/create-shipment/CreateShipmentModal';
import { ManageAssetsModal } from '../../4_features/manage-assets/ManageAssetsModal';
import { useLiveOrders } from '../../5_entities/order/api/useLiveOrders';
import { PlusCircle, Train, AlertTriangle, Clock } from 'lucide-react';
import { PageLayout } from '@/6_shared/ui/PageLayout';
import { actionButtonClass, pageStyles } from '@/6_shared/ui/pageStyles';
import { MetricCard } from '@/6_shared/ui/MetricCard';

export const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  const { orders, isLoading, refetch } = useLiveOrders();

  const activeOrders = orders.filter(o => o.status === 'У дорозі').length;
  const pendingOrders = orders.filter(o => o.status === 'Очікує').length;
  const deliveredOrders = orders.filter(o => o.status === 'Доставлено').length;
  
  const efficiency = orders.length > 0 
    ? Math.round((deliveredOrders / orders.length) * 100) 
    : 100;

  return (
    <>
      <PageLayout mainClassName="overflow-y-auto p-8 pt-4">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className={pageStyles.title}>Вантажні перевезення</h1>
              <p className="text-slate-500 font-medium text-sm">Керуйте та відстежуйте активні залізничні маршрути.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className={actionButtonClass('primary')}>
              <PlusCircle className="w-4 h-4" /> Створити заявку
            </button>
          </div>

          <div className={pageStyles.metricGrid}>
            <MetricCard
              label="Активні перевезення"
              value={activeOrders}
              hint="Вагони у дорозі"
              tone="primary"
              icon={<Train className="w-4 h-4" />}
            />
            <MetricCard
              label="Очікують підтвердження"
              value={pendingOrders}
              hint="Потребують обробки"
              tone="warning"
              icon={<AlertTriangle className="w-4 h-4" />}
            />
            <MetricCard
              label="Ефективність мережі"
              value={`${efficiency}%`}
              hint="Успішно доставлено"
              tone="neutral"
              icon={<Clock className="w-4 h-4" />}
            />
          </div>

          <div className="mb-8">
            <LiveManifest
              orders={orders}
              isLoading={isLoading}
              selectedOrderId={selectedOrderId}
              onSelectOrder={setSelectedOrderId}
            />
          </div>

          <div>
            <CapacityOverview onManageClick={() => setIsAssetsModalOpen(true)} />
          </div>
      </PageLayout>

      <CreateShipmentModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          refetch();
        }} 
      />

      <ManageAssetsModal 
        isOpen={isAssetsModalOpen}
        onClose={() => setIsAssetsModalOpen(false)}
      />
    </>
  );
};