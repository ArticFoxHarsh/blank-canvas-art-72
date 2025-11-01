import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SESSION_ID = 'shared-calculator';

export const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load initial state
    loadState();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('calculator-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calculator_state',
          filter: `session_id=eq.${SESSION_ID}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newState = payload.new;
            setDisplay(newState.display);
            setPreviousValue(newState.previous_value);
            setOperation(newState.operation);
            setWaitingForOperand(newState.waiting_for_operand);
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const count = Object.keys(presenceState).length;
        setActiveUsers(count);
        setIsConnected(true);
      })
      .on('presence', { event: 'join' }, () => {
        const presenceState = channel.presenceState();
        const count = Object.keys(presenceState).length;
        setActiveUsers(count);
      })
      .on('presence', { event: 'leave' }, () => {
        const presenceState = channel.presenceState();
        const count = Object.keys(presenceState).length;
        setActiveUsers(count);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: Math.random().toString(36).substring(7),
            online_at: new Date().toISOString(),
          });
          setIsConnected(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadState = async () => {
    const { data, error } = await supabase
      .from('calculator_state')
      .select('*')
      .eq('session_id', SESSION_ID)
      .single();

    if (!error && data) {
      setDisplay(data.display);
      setPreviousValue(data.previous_value);
      setOperation(data.operation);
      setWaitingForOperand(data.waiting_for_operand);
    }
  };

  const saveState = async (
    newDisplay: string,
    newPrevious: string | null,
    newOperation: string | null,
    newWaiting: boolean
  ) => {
    const { error } = await supabase
      .from('calculator_state')
      .upsert(
        {
          session_id: SESSION_ID,
          display: newDisplay,
          previous_value: newPrevious,
          operation: newOperation,
          waiting_for_operand: newWaiting,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'session_id' }
      );

    if (error) {
      console.error('Error saving state:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to sync calculator state',
        variant: 'destructive',
      });
    }
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
      saveState(digit, previousValue, operation, false);
    } else {
      const newDisplay = display === '0' ? digit : display + digit;
      setDisplay(newDisplay);
      saveState(newDisplay, previousValue, operation, false);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      saveState('0.', previousValue, operation, false);
    } else if (display.indexOf('.') === -1) {
      const newDisplay = display + '.';
      setDisplay(newDisplay);
      saveState(newDisplay, previousValue, operation, false);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    saveState('0', null, null, false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue == null) {
      setPreviousValue(String(inputValue));
      saveState(display, String(inputValue), nextOperation, true);
    } else if (operation) {
      const prevValue = parseFloat(previousValue);
      const newValue = calculate(prevValue, inputValue, operation);
      const newDisplay = String(newValue);
      setDisplay(newDisplay);
      setPreviousValue(newDisplay);
      saveState(newDisplay, newDisplay, nextOperation, true);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, op: string): number => {
    switch (op) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '%':
        return firstValue % secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue != null && operation) {
      const prevValue = parseFloat(previousValue);
      const newValue = calculate(prevValue, inputValue, operation);
      const newDisplay = String(newValue);
      setDisplay(newDisplay);
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
      saveState(newDisplay, null, null, true);
    }
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay);
      saveState(newDisplay, previousValue, operation, waitingForOperand);
    } else {
      setDisplay('0');
      saveState('0', previousValue, operation, waitingForOperand);
    }
  };

  const toggleSign = () => {
    const newDisplay = display.charAt(0) === '-' ? display.slice(1) : '-' + display;
    setDisplay(newDisplay);
    saveState(newDisplay, previousValue, operation, waitingForOperand);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6 w-full max-w-sm bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl">
          {/* Connection Status */}
          <div className="flex items-center justify-between mb-4 text-sm">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-muted-foreground">Offline</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{activeUsers} online</span>
            </div>
          </div>

          {/* Display */}
          <div className="mb-4 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 shadow-inner">
            <div className="text-right text-4xl font-bold text-foreground break-all">
              {display}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button variant="special" onClick={clear} className="text-lg font-bold">
              AC
            </Button>
            <Button variant="special" onClick={toggleSign} className="text-lg">
              +/-
            </Button>
            <Button variant="special" onClick={() => performOperation('%')} className="text-lg">
              %
            </Button>
            <Button variant="operator" onClick={() => performOperation('÷')} className="text-xl">
              ÷
            </Button>

            <Button variant="calculator" onClick={() => inputDigit('7')} className="text-xl">
              7
            </Button>
            <Button variant="calculator" onClick={() => inputDigit('8')} className="text-xl">
              8
            </Button>
            <Button variant="calculator" onClick={() => inputDigit('9')} className="text-xl">
              9
            </Button>
            <Button variant="operator" onClick={() => performOperation('×')} className="text-xl">
              ×
            </Button>

            <Button variant="calculator" onClick={() => inputDigit('4')} className="text-xl">
              4
            </Button>
            <Button variant="calculator" onClick={() => inputDigit('5')} className="text-xl">
              5
            </Button>
            <Button variant="calculator" onClick={() => inputDigit('6')} className="text-xl">
              6
            </Button>
            <Button variant="operator" onClick={() => performOperation('-')} className="text-xl">
              -
            </Button>

            <Button variant="calculator" onClick={() => inputDigit('1')} className="text-xl">
              1
            </Button>
            <Button variant="calculator" onClick={() => inputDigit('2')} className="text-xl">
              2
            </Button>
            <Button variant="calculator" onClick={() => inputDigit('3')} className="text-xl">
              3
            </Button>
            <Button variant="operator" onClick={() => performOperation('+')} className="text-xl">
              +
            </Button>

            <Button variant="calculator" onClick={() => inputDigit('0')} className="col-span-2 text-xl">
              0
            </Button>
            <Button variant="calculator" onClick={inputDecimal} className="text-xl">
              .
            </Button>
            <Button variant="operator" onClick={handleEquals} className="text-xl">
              =
            </Button>
          </div>

          <div className="mt-4">
            <Button variant="ghost" onClick={handleBackspace} className="w-full">
              Backspace
            </Button>
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>🎉 Real-time collaborative calculator</p>
            <p className="mt-1">Changes sync instantly across all users</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
