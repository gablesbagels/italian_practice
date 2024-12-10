from django import forms
from .models import PlayerScores, Student, ScheduledCall
from django.forms import Textarea
from django_countries import countries
from phonenumber_field.formfields import SplitPhoneNumberField
from .utils import COUNTRY_DIALING_CODES
from datetime import datetime, timedelta
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

import pytz

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']
        widgets = {
            'optional_message': Textarea(attrs={
                'class': "form-control",
                'style': 'max-length: 500; height: 100px; resize:none;',
                'placeholder': '(optional)'
            }),
          
            'username': forms.TextInput(attrs={
                'class': 'form-control'
            }),
            'email': forms.TextInput(attrs={
                'class': 'form-control'
            }),
            'first_name': forms.TextInput(attrs={
                'class': 'form-control'
            }),
            'last_name': forms.TextInput(attrs={
                'class': 'form-control'
            }),
        }


def country_code_to_flag(country_code):
    return ''.join(chr(127397 + ord(c)) for c in country_code.upper())

class FlagPhoneNumberWidget(forms.MultiWidget):
    def __init__(self, attrs=None):
        widgets = [
            forms.Select(choices=self.get_country_choices(), attrs={'class': 'country-select custom-select-split-phone',
                                                                    'default': 'US'}),
            forms.TextInput(attrs={'class': 'margin_left_hardcord_5px width_hardcode_55_pct',
                                   'placeholder': '(optional)'})
        ]
        super().__init__(widgets, attrs)

    def decompress(self, value):
        if value:
            return value.split('-', 1)  # Split country code and number
        return [None, None]

    def get_country_choices(self):
        country_choices = [
        (code, f'{country_code_to_flag(code)} {code} ({COUNTRY_DIALING_CODES.get(code)})')
        for code, name in list(countries)
        if COUNTRY_DIALING_CODES.get(code) ]
        return country_choices

    def format_output(self, rendered_widgets):
        rendered_widgets[0] = rendered_widgets[0].replace('<option value="', '<option class="fi fi-')
        return super().format_output(rendered_widgets)

class NewStudentForm(forms.ModelForm):
    phone_number = SplitPhoneNumberField(widget=FlagPhoneNumberWidget(), 
                                         label="Phone Number",
                                         required=False)

    class Meta:
        model = Student
        exclude = ('notes', 'classes_completed', 'actual_timeslot', 'package_price', 'paid_amount')

        fields = [
            'first_name', 'last_name', 'phone_number', 'guardian_full_name', 'contact_email', 
            'course_selection', 'preferred_day_1','preferred_timeslot_1', 'preferred_day_2', 'preferred_timeslot_2',
            'previous_experience', 
            'tailoring_notes',
            'optional_message'
        ]
        labels = {
            'first_name': 'First Name',
            'last_name': 'Last Name',
            'contact_email': 'Email',
            'course_selection': 'Course Selection',
            'guardian_full_name': 'Guardian Name',
            'optional_message': 'For anything more you want me to know or questions you may have!',            
            'previous_experience': 'Any previous experience with code?',
            'tailoring_notes': 'Got a project or a goal? If yes, please tell me more!'
        }
        widgets = {
            'previous_experience': Textarea(attrs={
                'class': "form-control",
                'style': 'max-length: 500; height: 100px; resize:none;',
                'placeholder': '(optional)'
            }),
            'optional_message': Textarea(attrs={
                'class': "form-control",
                'style': 'max-length: 500; height: 100px; resize:none;',
                'placeholder': '(optional)'
            }),
            'tailoring_notes': Textarea(attrs={
                'class': "form-control",
                'style': 'max-length: 500; height: 100px; resize:none;',
                'placeholder': '(optional)'
            }),
            'preferred_day_1': forms.Select(attrs={
                'class': 'form-control custom-select'  # Add your class here
            }),
            'preferred_timeslot_1': forms.Select(attrs={
                'class': 'form-control custom-select'  # Add your class here
            }),
            'preferred_day_2': forms.Select(attrs={
                'class': 'form-control custom-select'  # Add your class here
            }),
            'preferred_timeslot_2': forms.Select(attrs={
                'class': 'form-control custom-select'  # Add your class here
            }),
            'course_selection': forms.Select(attrs={
                'class': 'form-control custom-select'  # Add your class here
            }),
            'first_name': forms.TextInput(attrs={
                'class': 'form-control'
            }),
            'last_name': forms.TextInput(attrs={
                'class': 'form-control'
            }),
            'contact_email': forms.TextInput(attrs={
                'class': 'form-control'
            }),
            'guardian_full_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '(Only required if under 18)'
            })
            
        }

class ScheduleCallForm(forms.ModelForm):
    initial_date = (datetime.now() + timedelta(days=3)).replace(hour=12, minute=0, second=0, microsecond=0)
    initial_date_2 = (datetime.now() + timedelta(days=3)).replace(hour=13, minute=0, second=0, microsecond=0)
    formatted_initial_date = initial_date.strftime('%Y/%m/%d %H:%M')
    formatted_initial_date_2 = initial_date_2.strftime('%Y/%m/%d %H:%M')

    preferred_date = forms.DateTimeField(
        widget=forms.DateTimeInput(
            attrs={
                'class': 'form-control',
                'id': 'id_preferred_date'
            } 
        ),
        label="Preferred Date and Time",
        initial=formatted_initial_date,
        input_formats=[
            '%Y/%m/%d %H:%M',    # Accept 24-hour format input from datetimepicker
            '%Y/%m/%d %I:%M %p'  # Also accept 12-hour format with AM/PM, just in case
        ],
    )

    preferred_date_2 = forms.DateTimeField(
        widget=forms.DateTimeInput(attrs={'class': 'form-control'}), 
        label="Time Preference 2",
        initial=formatted_initial_date_2,
        input_formats=[
            '%Y/%m/%d %H:%M',    # Accept 24-hour format input from datetimepicker
            '%Y/%m/%d %I:%M %p'  # Also accept 12-hour format with AM/PM, just in case
        ],
    )

    phone_number = SplitPhoneNumberField(widget=FlagPhoneNumberWidget(), 
                                         label="Phone Number",
                                         required=False)

    class Meta:
        model = ScheduledCall
        exclude = ('contacted', 'actual_timeslot')

        fields = [
            'first_name', 'last_name', 'phone_number', 'contact_email', 
            'preferred_date', 'preferred_date_2', 'optional_message'
        ]
        labels = {
            'first_name': 'First Name',
            'last_name': 'Last Name',
            'contact_email': 'Email',
            'optional_message': 'Message',            
        }
        widgets = {
            'optional_message': Textarea(attrs={
                'class': "form-control",
                'style': 'max-length: 500; height: 100px; resize:none;',
                'placeholder': '(optional)'
            }),
          
            'first_name': forms.TextInput(attrs={
                'class': 'form-control'
            }),
            'last_name': forms.TextInput(attrs={
                'class': 'form-control'
            }),
            'contact_email': forms.TextInput(attrs={
                'class': 'form-control'
            })
            
        }



        

        