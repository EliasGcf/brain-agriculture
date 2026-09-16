import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { useDebounce } from '@hooks/use-debounce';
export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
}
export interface AsyncSelectProps<T> {
  /** Async function to fetch options */
  fetcherOptions: (query?: string) => Promise<T[]>;
  /** Async function to fetch a single option when it is missing from the options list */
  fetcherOption?: (id: string) => Promise<T | null>;
  /** Preload all data ahead of time */
  preload?: boolean;
  /** Function to filter options */
  filterFn?: (option: T, query: string) => boolean;
  /** Function to render each option */
  renderOption: (option: T) => React.ReactNode;
  /** Function to get the value from an option */
  getOptionValue: (option: T) => string;
  /** Function to get the display value for the selected option */
  getDisplayValue: (option: T) => React.ReactNode;
  /** Custom not found message */
  notFound?: React.ReactNode;
  /** Custom loading skeleton */
  loadingSkeleton?: React.ReactNode;
  /** Currently selected value */
  value: string;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Label for the select field */
  label: string;
  /** Placeholder text when no selection */
  placeholder?: string;
  /** Disable the entire select */
  disabled?: boolean;
  /** Custom width for the popover */
  width?: string | number;
  /** Custom class names */
  className?: string;
  /** Custom trigger button class names */
  triggerClassName?: string;
  /** Custom no results message */
  noResultsMessage?: string;
  /** Allow clearing the selection */
  clearable?: boolean;
}
export function AsyncSelect<T>({
  fetcherOptions,
  fetcherOption,
  preload,
  filterFn,
  renderOption,
  getOptionValue,
  getDisplayValue,
  notFound,
  loadingSkeleton,
  label,
  placeholder = 'Select...',
  value,
  onChange,
  disabled = false,
  width = '200px',
  className,
  triggerClassName,
  noResultsMessage,
  clearable = true,
}: AsyncSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState(value);
  const [selectedOption, setSelectedOption] = useState<T | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, preload ? 0 : 300);
  const originalOptions = useRef<T[]>([]);
  const hasLoadedOptions = useRef(false);
  const fetchedValue = useRef<string | null>(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    if (!value) {
      fetchedValue.current = null;
      setSelectedOption(null);
      return;
    }

    const option = options.find((item) => getOptionValue(item) === value);
    if (option) {
      setSelectedOption(option);
      return;
    }

    if (!fetcherOption || fetchedValue.current === value) {
      return;
    }

    fetchedValue.current = value;
    let active = true;

    fetcherOption(value)
      .then((fetchedOption) => {
        if (!active || !fetchedOption) {
          return;
        }

        setSelectedOption(fetchedOption);
        setOptions((currentOptions) =>
          currentOptions.some((item) => getOptionValue(item) === value)
            ? currentOptions
            : [fetchedOption, ...currentOptions],
        );
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to fetch option');
        }
      });

    return () => {
      active = false;
    };
  }, [fetcherOption, getOptionValue, options, value]);

  useEffect(() => {
    let active = true;

    const fetchOptions = async () => {
      if (preload && hasLoadedOptions.current) {
        setOptions(
          debouncedSearchTerm
            ? originalOptions.current.filter((option) =>
                filterFn ? filterFn(option, debouncedSearchTerm) : true,
              )
            : originalOptions.current,
        );
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetcherOptions(debouncedSearchTerm);
        if (!active) {
          return;
        }

        originalOptions.current = data;
        setOptions(data);
        hasLoadedOptions.current = true;
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to fetch options');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOptions();

    return () => {
      active = false;
    };
  }, [debouncedSearchTerm, fetcherOptions, filterFn, preload]);
  const handleSelect = useCallback(
    (currentValue: string) => {
      const newValue = clearable && currentValue === selectedValue ? '' : currentValue;
      setSelectedValue(newValue);
      setSelectedOption(
        options.find((option) => getOptionValue(option) === newValue) || null,
      );
      onChange(newValue);
      setOpen(false);
    },
    [selectedValue, onChange, clearable, options, getOptionValue],
  );
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="w-full">
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              role="combobox"
              aria-label={label}
              aria-expanded={open}
              className={cn(
                'justify-between',
                disabled && 'opacity-50 cursor-not-allowed',
                triggerClassName,
              )}
              style={{ width: width }}
              disabled={disabled}
            >
              <span className="min-w-0 flex-1 truncate text-left">
                {selectedOption ? getDisplayValue(selectedOption) : placeholder}
              </span>
              <ChevronsUpDown className="shrink-0 opacity-50" size={10} />
            </Button>
          }
        />
      </div>
      <PopoverContent
        className={cn('w-(--anchor-width) p-0', className)}
      >
        <Command shouldFilter={false}>
          <div className="relative w-full">
            <CommandInput
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchTerm}
              onValueChange={(value) => {
                setSearchTerm(value);
              }}
            />
            {loading && options.length > 0 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
          <CommandList>
            {error && <div className="p-4 text-destructive text-center">{error}</div>}
            {loading &&
              options.length === 0 &&
              (loadingSkeleton || <DefaultLoadingSkeleton />)}
            {!loading &&
              !error &&
              options.length === 0 &&
              (notFound || (
                <CommandEmpty>
                  {noResultsMessage ?? `No ${label.toLowerCase()} found.`}
                </CommandEmpty>
              ))}
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={getOptionValue(option)}
                  value={getOptionValue(option)}
                  data-checked={selectedValue === getOptionValue(option)}
                  onSelect={handleSelect}
                >
                  {renderOption(option)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DefaultLoadingSkeleton() {
  return (
    <CommandGroup>
      {[1, 2, 3].map((i) => (
        <CommandItem key={i} disabled>
          <div className="flex items-center gap-2 w-full">
            <div className="h-6 w-6 rounded-full animate-pulse bg-muted" />
            <div className="flex flex-col flex-1 gap-1">
              <div className="h-4 w-24 animate-pulse bg-muted rounded" />
              <div className="h-3 w-16 animate-pulse bg-muted rounded" />
            </div>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
