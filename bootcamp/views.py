import requests
import json
import traceback
from django.http import JsonResponse
from bs4 import BeautifulSoup
from django.http import HttpResponse
from django.shortcuts import render, redirect
from asgiref.sync import sync_to_async
from django.views.generic import TemplateView
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.http import HttpResponse
from django.shortcuts import redirect
from django.template.loader import render_to_string
from bootcamp.models import ItalianVerb, PlayerScores
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from .forms import CustomUserCreationForm
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib import messages
from django.contrib.auth.models import User
from django.utils.encoding import force_str
from django.contrib.auth.decorators import permission_required
from django.urls import reverse
from django.db.models import Max, Min
import random

SUBJECT_CHOICES = {
    'Io': 'io',
    'Tu': 'tu',
    'Lei/Lui': 'lei/lui',
    'Lei': 'lei',
    'Lui': 'lui',
    'Noi': 'noi',
    'Voi': 'voi',
    'Loro': 'loro'
}

SUBJECT_CHOICES_BY_ORDER = {
    'Io': 0,
    'Tu': 0,
    'Lei/Lui': 1,
    'Lei': 1,
    'Lui': 1,
    'Noi': 2,
    'Voi': 3,
    'Loro': 4
}

TENSE_CHOICES = {
    'Presente': 'Indicativo Presente',
    'Imperfetto': 'Indicativo Imperfetto',
    'Passato Prossimo': 'Indicativo Passato prossimo',
    'Futuro Semplice': 'Indicativo Futuro semplice',
    'Futuro Anteriore': 'Indicativo Futuro anteriore',
    'Trapassato Prossimo': 'Indicativo Trapassato prossimo',
    'Congiuntivo Presente': 'Congiuntivo Presente',
    'Congiuntivo Imperfetto': 'Congiuntivo Imperfetto',
    'Condizionale Presente': 'Condizionale Presente',
    'Condizionale Passato': 'Condizionale Passato',
    # 'Congiuntivo Trapassato': 'Congiuntivo Trapassato',
    # 'Congiuntivo Passato': 'Congiuntivo Passato',
    # 'Imperativo': 'Imperativo Presente',
    # 'Gerundio': 'Gerundio'  # Uncomment if needed
}

def top_ten_scores(request):
    # Query to get the top 10 highest scores ordered by 'score' descending
    # there is an index already
    top_scores = PlayerScores.objects.order_by('-score')[:10]
    scores_data = [
        {
            "initials": score.initials,
            "score": score.score,
            "created_date": score.created_date.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for score in top_scores
    ]

   
    return JsonResponse({
        "status": "success",
        "top_scores": scores_data
    }, status=200)

def save_score(request):
    if request.method == "POST":
        try:
            
            data = json.loads(request.body)
            
            initials = data.get("initials", "").upper()[:3]
            score = int(data.get("score", 0))

            count = PlayerScores.objects.filter(score__gte=score).count() + 1
            rank_at_created = count

            player_score = PlayerScores.objects.create(
                initials=initials,
                score=score,
                rank_at_created = rank_at_created
            )

            player_score.refresh_from_db()
            return JsonResponse({
                "status": "success",
                "message": "Score saved successfully!",
                "data": {
                    "id": player_score.id,
                    "initials": player_score.initials,
                    "score": player_score.score,
                    "rank_at_created": rank_at_created,
                    "created_date": player_score.created_date,
                }
            }, status=201)

        except (json.JSONDecodeError, ValueError, KeyError) as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)

def italian_conjugation(request):
    while True:
        first_verbs = ["essere", "avere"]
        first_tenses = ["Presente", "Imperfetto", "Condizionale Presente", "Futuro Semplice"]
        infinitive =  random.choice(list(first_verbs))
        tense = random.choice(list(first_tenses))
        subject = random.choice(list(SUBJECT_CHOICES.keys()))
        
        # If the combination is invalid, re-generate
        if not (tense == 'Imperativo' and subject == 'Io'):
            break

    print(f"Random Tense: {tense}")
    print(f"Random Subject: {subject}")
    print(f"Random Infinitive: {infinitive}")

    subject_cleaned, participle, auxillary, verb = get_random_conjugation(infinitive, TENSE_CHOICES[tense], subject)
    subject_answer = subject_answer = ''

    return render(request, 'italian_practice/conjugation_game.html', {'infinitive': infinitive, 'verb': verb, 'tense': tense, 'subject': subject_cleaned,  'subject_answer': subject_answer, 'participle': participle.strip() if participle is not None else '', 'auxillary': auxillary if auxillary is not None else ''})

def get_italian_conjugation(request):
    id_range = ItalianVerb.objects.aggregate(min_id=Min('id'), max_id=Max('id'))

    if id_range['min_id'] is not None and id_range['max_id'] is not None:
        while True:
            random_id = random.randint(id_range['min_id'], id_range['max_id'])

            random_verb = ItalianVerb.objects.filter(id=random_id).first()
            if random_verb:
                print(f"Random Verb: {random_verb.verb}")
                break
    else:
        print("Table is empty.")

    while True:
        tense = random.choice(list(TENSE_CHOICES.keys()))
        subject = random.choice(list(SUBJECT_CHOICES.keys()))
        
        if not (tense == 'Imperativo' and subject == 'Io'):
            break
 
    print(f"Random Tense: {tense}")
    print(f"Random Subject: {subject}")
    subject_cleaned, participle, auxillary, verb = get_random_conjugation(random_verb, TENSE_CHOICES[tense], subject)
    
    response = {'infinitive': random_verb.verb, 'verb': verb, 'tense': tense, 'subject': subject_cleaned,  'participle': participle, 'auxillary': auxillary}
    return JsonResponse(response)


def get_random_conjugation(random_verb, tense, subject):
        url = f"https://conjugator.reverso.net/conjugation-italian-verb-{random_verb}.html"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        }
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            html_content = response.text
        else:
            raise Exception(f"Failed to fetch the page. Status code: {response.status_code}")

        # Parse the HTML content using BeautifulSoup
        soup = BeautifulSoup(html_content, "html.parser")

        span_tag = soup.find("span", id="ch_lblAuxiliary")
        if span_tag:
            a_tag = span_tag.find("a")
            if a_tag:
                link_value = a_tag.text
                print("Value inside the link:", link_value)

        if "lei/lui" in subject.lower() and ("passato" in tense.lower() or "anteriore" in tense.lower()) and "essere" in link_value.lower():
            him_her_choices = ["lei", "lui"]
            subject = random.choice(him_her_choices)
            print(f"reassigned: {subject}")

        tense_div = soup.find("div", {"mobile-title": tense})
        if not tense_div:
            raise Exception(f"Could not find the '{tense}'.")

        if tense is "Gerundio":
            verb_forms_div = soup.find("div", class_="verb-forms-wrap")
            if not verb_forms_div:
                raise Exception(f"Could not find the '{tense}'.")
            h2_elements = verb_forms_div.find_all("h2")
            if len(h2_elements) > 1:
                second_h2 = h2_elements[1]
                gerund = second_h2.find("div").find("a").text.strip()
                print(f"Found gerund {gerund}")
                return
            else:
                print("The gerund was not found.")


        # Find the first item in the 'wrap-verbs-listing'
        wrap_verbs_listing = tense_div.find("ul", class_="wrap-verbs-listing")
        if not wrap_verbs_listing:
            raise Exception("Could not find the ul with class 'wrap-verbs-listing'.")

        print(f"final: {subject}")
        return check_verb_listing(subject, wrap_verbs_listing)

def check_verb_listing(subject, wrap_verbs_listing):
    target_subject = None
    for li in wrap_verbs_listing.find_all("li"):
        graytxt = li.find("i", class_="graytxt")
        if graytxt and graytxt.text.strip() == SUBJECT_CHOICES[subject].lower():
            target_subject = li
            break
        if "lei" in subject.lower() and graytxt and "lei" in graytxt.text.strip():
            target_subject = li
            break
        if "lui" in subject.lower() and graytxt and "lui" in graytxt.text.strip():
            target_subject = li
            break

    if target_subject:
        # Get the value inside the element with class 'verbtxt'
        subject = target_subject.find("i", class_="graytxt").text.strip() if target_subject.find("i", class_="graytxt") else None
        participle = target_subject.find_all("i", class_="particletxt")[-1].text.strip() if target_subject.find("i", class_="particletxt") else None
        auxillary = target_subject.find("i", class_="auxgraytxt").text.strip() if target_subject.find("i", class_="auxgraytxt") else None
        verb = target_subject.find("i", class_="verbtxt").text.strip() if target_subject.find("i", class_="verbtxt") else None

        if not verb:
            raise Exception("Could not find the element with class 'verbtxt'.")

        # Extract and print the verb text
        print("Extracted participle:", participle)
        print("Extracted auxillary:", auxillary)
        print("Extracted verb:", verb)
        return subject, participle, auxillary, verb
    else:
        all_listings = wrap_verbs_listing.find_all("li")
        target_subject = all_listings[SUBJECT_CHOICES_BY_ORDER[subject]]
        if target_subject:
            subject = target_subject.find("i", class_="graytxt").text.strip() if target_subject.find("i", class_="graytxt") else None
            participle = target_subject.find_all("i", class_="particletxt")[-1].text.strip() if target_subject.find("i", class_="particletxt") else None
            auxillary = target_subject.find("i", class_="auxgraytxt").text.strip() if target_subject.find("i", class_="auxgraytxt") else None
            verb = target_subject.find("i", class_="verbtxt").text.strip() if target_subject.find("i", class_="verbtxt") else None

            if not verb:
                raise Exception("Could not find the element with class 'verbtxt'.")

            # Extract and print the verb text
            print("Extracted verb:", verb)
            return subject, None, None, verb
        else:
            print("No matching list item found.")
            print(wrap_verbs_listing.prettify())
            return None, None, None, None

def send_email_italian_comment(request):
    if request.method == 'POST':
        try:
            email = request.POST.get('email')
            question = request.POST.get('question')
            subject = 'Comment Received!'
            admin_subject = "General Comment"
            from_email = settings.EMAIL_HOST_USER
            recipient_list = [email]
            
            html_message = render_to_string('email_question_auto_response_italian.html', {
                'question': question,
            })
            admin_html_message = render_to_string('email_question_admin_notification_italian.html', {
                'question': question,
                'email': email,
            })
            
            text_message = 'I have received your comment and will be in touch soon!'

            msg = EmailMultiAlternatives(subject, text_message, from_email, recipient_list)
            admin_msg = EmailMultiAlternatives(admin_subject, text_message, from_email, [from_email])
            
            msg.attach_alternative(html_message, "text/html")
            admin_msg.attach_alternative(admin_html_message, "text/html")
            
            admin_msg.send()
            msg.send()

            return HttpResponse('Email sent successfully')
        except Exception as e:
            traceback.print_exc()
            return HttpResponse('Email not sent')

class UnderConstruction(TemplateView):

  async def get(self, request, *args, **kwargs):
        return await sync_to_async(render)(request, "italian_practice/under_construction.html")
