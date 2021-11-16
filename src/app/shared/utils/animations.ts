import {
    animate,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';

export const sideToggle = trigger('sideToggle', [
    state('open', style({
        width: '20rem'
    })),
    state('closed', style({
        width: '3rem'
    })),
    transition('open <=> closed', [animate('300ms 150ms ease-in-out')])
]);
export const contentToggle = trigger('contentToggle', [
    state('open', style({
        'margin-left': '20rem'
    })),
    state('closed', style({
        'margin-left': '3rem'
    })),
    transition('open <=> closed', [animate('300ms 150ms ease-in-out')])
]);

export const sidebarButtonStateTrigger = trigger('sidebarButtonState', [
        state('opened', style({
                transform: 'rotate(0deg)'
        })),
        state('closed', style({
                transform: 'rotate(180deg)'
        })),
        transition('opened => closed', [animate('300ms ease-out')]),
        transition('closed => opened', [animate('300ms ease-out')])
    ]
);

export const shownStateTrigger = trigger('shownState', [
        transition(':enter', [style({ opacity: 0 }), animate('200ms ease-out', style({ opacity: 1 }))]),
        transition(':leave', [animate('500ms ease-out', style({ opacity: 0 }))])
]);

export const rowExpandButtons = trigger('rowExpandButtons', [
    state('shown', style({
        transform: 'translateX(0px)'
    })),
    state('hidden', style({
        transform: 'translateX(-600px)'
    })),
    transition('shown <=> hidden', [animate('300ms ease-out')])
]);

export const rowExpand = trigger('rowExpand', [
    state('collapsed, void', style({ height: '0px', paddingRight: '50%', minHeight: '0', display: 'none' })),
    state('expanded', style({ minHeight: '*', height: '*', paddingRight: '*', display: '*' })),
    transition('expanded <=> collapsed', animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    transition('expanded <=> void', animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
]);

export const togglePanel = trigger(
    'togglePanel', [
    state('shown', style({
        width: '*',
        flex: '*',
        'min-width': '*',
        overflow: '*',
        'border-right': '*'
    })),
    state('hidden', style({
        width: '0rem',
        flex: '0 0 0%',
        'min-width': '0rem',
        overflow: 'hidden',
        'border-right': 'none'
    })),
    transition('shown <=> hidden', [animate('150ms 180ms cubic-bezier(0.935, 0, 0.34, 1.33)')])
]);
