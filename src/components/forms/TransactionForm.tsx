import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tool } from "@/types/tool";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface TransactionFormProps {
  tool: Tool;
  onSuccess?: () => void; // Optional callback on success
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ tool, onSuccess }) => {
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!date?.from || !date?.to) {
      setError("Please select a valid date range.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload = {
      tool_id: tool.id,
      start_date: date.from.toISOString(),
      end_date: date.to.toISOString(),
      transaction_type: tool.price ? "rental" : "lending",
    };

    try {
      const endpoint = tool.price ? "/rentals/request" : "/transactions/borrow";
      // The payload for both endpoints is a TransactionCreate schema
      await api.post(endpoint, payload);

      toast({
        title: "Success!",
        description: "Your request has been submitted for approval.",
      });

      if (onSuccess) onSuccess();

      // Navigate to transactions page after success
      navigate("/transactions");

    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Failed to submit request.";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <h3 className="font-semibold">{tool.name}</h3>
        <p className="text-sm text-muted-foreground">
          Pilih rentang tanggal untuk peminjaman atau penyewaan.
        </p>
      </div>
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              disabled={(day) => day < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </PopoverContent>
        </Popover>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={handleSubmit} disabled={isLoading || !date?.from || !date?.to}>
        {isLoading ? "Submitting..." : "Submit Request"}
      </Button>
    </div>
  );
};
