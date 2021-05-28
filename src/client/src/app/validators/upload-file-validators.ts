import { FormControl } from '@angular/forms';

export function requiredFileType(type: string) {
  return function ( control: FormControl ) {
    const file = control.value;
    if ( file != null ) {
      const extension = file.split('.')[0].toLowerCase();
      if ( type.toLowerCase() !== extension.toLowerCase() ) {
        return {
          requiredFileType: true,
        };
      }
      return null;
    }
    return null;
  };
}
