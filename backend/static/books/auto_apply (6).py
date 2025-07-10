
import os
import time
import traceback
import requests
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from openai import OpenAI
from dotenv import load_dotenv

# Load environment and OpenAI
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

APPLICANT_INFO = {
    "first_name": "John",
    "last": "Doe",
    "email": "johndoe@example.com",
    "phone": "123-456-7890",
    "resume_path": "resume/resume.pdf",
    "resume_text": "John Doe is a skilled software developer with experience in Python, React, and automation tools. Previously worked at OpenAI and Airbnb."
}

def init_driver(headless=False):
    chrome_options = Options()
    if headless:
        chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver_path = "/usr/local/bin/chromedriver"
    service = Service(driver_path)
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def extract_questions_and_answers(url, resume_text):
    print("🔍 Extracting questions and answers from job description using OpenAI...")
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, "html.parser")
        job_text = soup.get_text(separator="\n").strip()

        prompt = f"""You are a job application assistant. Based on the job description below, extract any specific application questions and suggest ideal answers using the resume.

Job Description:
{job_text}

Resume:
{resume_text}

Return the output as a list of questions and answers formatted like:

Q: ...
A: ...
Q: ...
A: ...
"""

        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4
        )

        return completion.choices[0].message.content.strip()
    except Exception as e:
        print("❌ Failed to extract questions:", e)
        return ""

def resolve_final_application_url(initial_url):
    print("🔗 Resolving application link...")
    try:
        response = requests.get(initial_url)
        soup = BeautifulSoup(response.text, "html.parser")

        apply_link = soup.find("a", string=lambda x: x and "Apply" in x)
        if apply_link and apply_link.get("href"):
            final_url = urljoin(initial_url, apply_link["href"])
            print(f"➡️ Detected redirected platform URL: {final_url}")
            return final_url
    except Exception as e:
        print("❌ Failed to resolve application URL:", e)
    return initial_url

def apply_greenhouse(driver, url):
    driver.get(url)
    print(f"🌐 Page title: {driver.title}")
    time.sleep(2)

    try:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "first_name"))
        ).send_keys(APPLICANT_INFO["first_name"])
        driver.find_element(By.NAME, "last_name").send_keys(APPLICANT_INFO["last"])
        driver.find_element(By.NAME, "email").send_keys(APPLICANT_INFO["email"])
        driver.find_element(By.NAME, "phone").send_keys(APPLICANT_INFO["phone"])
        driver.find_element(By.NAME, "resume").send_keys(os.path.abspath(APPLICANT_INFO["resume_path"]))
        print("✅ Greenhouse form filled.")

        qa = extract_questions_and_answers(url, APPLICANT_INFO["resume_text"])
        print(qa)

    except Exception as e:
        print("❌ Greenhouse apply failed:")
        traceback.print_exc()

def apply_lever(driver, url):
    driver.get(url)
    print(f"🌐 Page title: {driver.title}")
    try:
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "name"))).send_keys(f"{APPLICANT_INFO['first_name']} {APPLICANT_INFO['last']}")
        driver.find_element(By.ID, "email").send_keys(APPLICANT_INFO["email"])
        driver.find_element(By.ID, "phone").send_keys(APPLICANT_INFO["phone"])
        driver.find_element(By.NAME, "resume").send_keys(os.path.abspath(APPLICANT_INFO["resume_path"]))
        print("✅ Lever form filled.")

        qa = extract_questions_and_answers(url, APPLICANT_INFO["resume_text"])
        print(qa)

    except Exception as e:
        print("❌ Lever apply failed:")
        traceback.print_exc()

def apply_workday(driver, url):
    driver.get(url)
    time.sleep(5)
    print("⚠️ Workday application not yet automated due to iframe/dynamic complexity.")

def detect_platform_and_apply(url):
    final_url = resolve_final_application_url(url)
    domain = urlparse(final_url).netloc
    driver = init_driver(headless=False)

    try:
        if "greenhouse.io" in domain:
            apply_greenhouse(driver, final_url)
        elif "lever.co" in domain:
            apply_lever(driver, final_url)
        elif "myworkdayjobs.com" in domain or "workday" in domain:
            apply_workday(driver, final_url)
        else:
            print("❓ Unknown platform. Manual apply recommended:", final_url)
    finally:
        time.sleep(5)
        driver.quit()

if __name__ == "__main__":
    test_url = "https://job-boards.greenhouse.io/remotecom/jobs/6349742003"
    detect_platform_and_apply(test_url)
