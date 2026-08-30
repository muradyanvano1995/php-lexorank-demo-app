import { FormDevTools, type FormDevToolsProps } from '@muradyanvano/use-form/devtools';
import type { FormValues } from '@muradyanvano/use-form';

/**
 * App-standard Form DevTools: docked inline + inherits light/dark CSS tokens
 * from `--form-devtools-*` in `resources/css/app.css`.
 */
export function AppFormDevTools<T extends FormValues = FormValues>(
    props: FormDevToolsProps<T>,
) {
    if (!import.meta.env.DEV) {
        return null;
    }

    return <FormDevTools position="inline" {...props} />;
}
