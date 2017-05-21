/* Inicialización en español para la extensión 'UI date picker' para jQuery. */
/* Traducido por Vester (xvester@gmail.com). */
jQuery(function($){
    $.datepicker.regional['es'] = {
        closeText: 'Cerrar',
        prevText: '&#x3c;Ant',
        nextText: 'Sig&#x3e;',
        currentText: 'Hoy',
        monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
        'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
        monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun',
        'Jul','Ago','Sep','Oct','Nov','Dic'],
        dayNames: ['Domingo','Lunes','Martes','Mi&eacute;rcoles','Jueves','Viernes','S&aacute;bado'],
        dayNamesShort: ['Dom','Lun','Mar','Mi&eacute;','Juv','Vie','S&aacute;b'],
        dayNamesMin: ['Do','Lu','Ma','Mi','Ju','Vi','S&aacute;'],
        weekHeader: 'Sm',
        dateFormat: 'dd/mm/yy',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''};
    $.datepicker._defaults = { // Global defaults for all the date picker instances
        showOn: 'button', // 'focus' for popup on focus, 'button' for trigger button, or 'both' for either
        showAnim: 'fadeIn', // Name of jQuery animation for popup
        showOptions: {}, // Options for enhanced animations
        defaultDate: null, // Used when field is blank: actual date,
            // +/-number for offset from today, null for today
        appendText: '', // Display text following the input box, e.g. showing the format
        buttonText: 'Seleccione la Fecha', // Text for trigger button
        buttonImage: '../images/ico/icono-calendario.png', // URL for trigger button image
        buttonImageOnly: true, // True if the image appears alone, false if it appears on a button
        hideIfNoPrevNext: false, // True to hide next/previous month links
            // if not applicable, false to just disable them
        navigationAsDateFormat: false, // True if date formatting applied to prev/today/next links
        gotoCurrent: false, // True if today link goes back to current selection instead
        changeMonth: false, // True if month can be selected directly, false if only prev/next
        changeYear: false, // True if year can be selected directly, false if only prev/next
        yearRange: 'c-10:c+10', // Range of years to display in drop-down,
            // either relative to today's year (-nn:+nn), relative to currently displayed year
            // (c-nn:c+nn), absolute (nnnn:nnnn), or a combination of the above (nnnn:-n)
        showOtherMonths: false, // True to show dates in other months, false to leave blank
        selectOtherMonths: false, // True to allow selection of dates in other months, false for unselectable
        showWeek: false, // True to show week of the year, false to not show it
        calculateWeek: this.iso8601Week, // How to calculate the week of the year,
            // takes a Date and returns the number of the week for it
        shortYearCutoff: '+10', // Short year values < this are in the current century,
            // > this are in the previous century,
            // string value starting with '+' for current year + value
        minDate: null, // The earliest selectable date, or null for no limit
        maxDate: null, // The latest selectable date, or null for no limit
        duration: 'fast', // Duration of display/closure
        beforeShowDay: null, // Function that takes a date and returns an array with
            // [0] = true if selectable, false if not, [1] = custom CSS class name(s) or '',
            // [2] = cell title (optional), e.g. $.datepicker.noWeekends
        beforeShow: null, // Function that takes an input field and
            // returns a set of custom settings for the date picker
        onSelect: null, // Define a callback function when a date is selected
        onChangeMonthYear: null, // Define a callback function when the month or year is changed
        onClose: null, // Define a callback function when the datepicker is closed
        numberOfMonths: 1, // Number of months to show at a time
        showCurrentAtPos: 0, // The position in multipe months at which to show the current month (starting at 0)
        stepMonths: 1, // Number of months to step back/forward
        stepBigMonths: 12, // Number of months to step back/forward for the big links
        altField: '', // Selector for an alternate field to store selected dates into
        altFormat: '', // The date format to use for the alternate field
        constrainInput: true, // The input is constrained by the current date format
        showButtonPanel: false, // True to show button panel, false to not show it
        autoSize: false, // True to size the input for the date format, false to leave as is
        disabled: false // The initial disabled state
    };
    $.datepicker.setDefaults($.datepicker.regional['es']);
    $.datepicker.setDefaults($.datepicker._defaults);
});