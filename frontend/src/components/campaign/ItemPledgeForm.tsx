import { zodResolver } from '@hookform/resolvers/zod';
import { Package } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { pledgeItemDonation } from '../../services/itemDonation.service';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

const pledgeSchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  deliveryNote: z.string().optional(),
});

type PledgeFormInputs = z.infer<typeof pledgeSchema>;

interface ItemPledgeFormProps {
  campaignId: string;
  onSuccess?: () => void;
}

const ItemPledgeForm = ({ campaignId, onSuccess }: ItemPledgeFormProps) => {
  const { isAuthenticated } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PledgeFormInputs>({
    resolver: zodResolver(pledgeSchema),
  });

  const onSubmit = async (data: PledgeFormInputs) => {
    if (!isAuthenticated) {
      toast.error('Please login to pledge an item.');
      return;
    }

    setIsSubmitting(true);
    try {
      await pledgeItemDonation({ ...data, campaignId });
      toast.success('Item Pledged', { description: 'Your item pledge has been recorded.' });
      reset();
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error('Pledge Failed', {
        description: err.response?.data?.message || 'Failed to pledge item.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white">
          <Package className="w-4 h-4 mr-2" />
          Pledge an Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pledge an Item</DialogTitle>
          <DialogDescription>
            Pledge an item to donate for this campaign. You can mark it as delivered later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name</Label>
            <Input
              id="itemName"
              placeholder="e.g., Blankets, Rice bags, Medicine"
              {...register('itemName')}
              disabled={isSubmitting}
            />
            {errors.itemName && (
              <p className="text-sm text-red-500">{errors.itemName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              placeholder="e.g., 10 pieces, 5 bags"
              {...register('quantity')}
              disabled={isSubmitting}
            />
            {errors.quantity && (
              <p className="text-sm text-red-500">{errors.quantity.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryNote">Delivery Note (optional)</Label>
            <Textarea
              id="deliveryNote"
              placeholder="Any notes about delivery timing, location, etc."
              {...register('deliveryNote')}
              disabled={isSubmitting}
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              'Submit Pledge'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ItemPledgeForm;
