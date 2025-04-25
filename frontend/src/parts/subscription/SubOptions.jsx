import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SubscriptionActionsDropdown({onDelete, onEdit, onCancel, onRemove, onRenew}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          •••
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {onEdit && 
          <DropdownMenuItem onClick ={onEdit}>
            Edit
          </DropdownMenuItem>
        }
        <DropdownMenuItem onClick={onDelete}>
          Delete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Change Subscription Status</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {onRenew && 
              <DropdownMenuItem onClick={onRenew}>
                Renew Subscription
              </DropdownMenuItem>
            }
            {onCancel &&
              <DropdownMenuItem onClick={onCancel}>
                Cancel Subscription
              </DropdownMenuItem>
            }
            {onRemove && 
              <DropdownMenuItem onClick={onRemove}>
                Cancel Subscription Immediately
              </DropdownMenuItem>
            }
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
