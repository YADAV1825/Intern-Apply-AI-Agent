import os
import json
import re
import pandas as pd
import gender_guesser.detector as gender_detector

d = gender_detector.Detector(case_sensitive=False)

MALE_NAMES_WITH_FEMALE_ENDINGS = {
    'aditya', 'krishna', 'rama', 'surya', 'rana', 'bawa', 'shiva', 'ravi', 'hari', 
    'rishi', 'mani', 'kavi', 'shashi', 'ali', 'wasim', 'mustafa', 'murtaza', 'raza', 
    'hamza', 'taha', 'murtaza', 'yashoda', 'bhim', 'indra', 'chandra', 'som', 'sukanya',
    'bala', 'kripa', 'subba', 'shiva', 'deva', 'appa', 'anna', 'giri', 'somesh', 'dhiraj',
    'pankaj', 'neeraj', 'suraj', 'manoj', 'vinod', 'pramod', 'vinay', 'vijay', 'ajay',
    'sanjay', 'dhananjay', 'mrityunjay', 'abhay', 'uday', 'malay', 'chinmay', 'tanmay',
    'ashwini', 'daksh', 'harsh', 'sparsh', 'lakshya', 'sourabh', 'saurabh', 'rishabh',
    'vaibhav', 'keshav', 'madhav', 'raghav', 'anubhav', 'prabhav', 'arnav', 'manav',
    'abhinav', 'pranav', 'ashwin', 'praveen', 'naveen', 'nitin', 'sachin', 'vipul',
    'atul', 'mukul', 'rahul', 'ansh', 'sparsh', 'ayush', 'piyush', 'dhruv', 'kartik',
    'ritvik', 'satvik', 'hardik', 'bhavik', 'prateek', 'shlok', 'alok', 'ashok', 'tilak',
    'mayank', 'shashank', 'mrigank', 'deepak', 'ronak', 'kanak', 'tarun', 'varun', 'arun',
    'karun', 'kiran', 'chandan', 'nandan', 'kundal', 'rohan', 'sohan', 'mohan', 'gopal',
    'kamal', 'vimal', 'nirmal', 'kunal', 'vishal', 'anmol', 'amol', 'sunil', 'anil', 'salil',
    'kapil', 'akhil', 'nikhil', 'sahil', 'allwyn', 'alwyn', 'albino', 'amit', 'sumit',
    'rohit', 'mohit', 'puneet', 'navneet', 'manmeet', 'gurpreet', 'harpreet', 'jaspreet',
    'amandeep', 'hardeep', 'mandeep', 'sandeep', 'kuldeep', 'pradeep', 'jaideep', 'navdeep',
    'sukhdeep', 'gagandeep', 'inderpreet', 'aman', 'arman', 'rehan', 'farhan', 'adnan',
    'zeeshan', 'irfan', 'imran', 'rizwan', 'salman', 'usman', 'gufran', 'faizan'
}

FEMALE_NAMES_WITH_MALE_ENDINGS = {
    'sheetal', 'shital', 'payal', 'kiran', 'simran', 'meenal', 'parul', 'komal',
    'kajal', 'anchal', 'aanchal', 'swaran', 'taran', 'charan', 'seerat', 'mannat',
    'navjot', 'harjot', 'gurjot', 'jasmin', 'jasmine', 'sharon', 'helen', 'karen',
    'catherine', 'allison', 'rachel', 'lauren', 'megan', 'alison', 'carol', 'susan',
    'karen', 'shirley', 'marion', 'doris', 'evelyn', 'gillian', 'vivian', 'lilian',
    'madhu', 'manju', 'anju', 'renu', 'tanu', 'bhanu', 'ritu', 'bindu', 'indu'
}

FEMALE_ENDINGS = (
    'a', 'i', 'ee', 'ita', 'ika', 'iya', 'nya', 'shree', 'priya', 'vathi', 
    'ti', 'na', 'ka', 'ni', 'li', 'ya', 'sha', 'ta', 'ma', 'la', 'da', 'ja',
    'va', 'ha', 'ra', 'ba', 'fa', 'ga', 'pa', 'sa', 'za'
)

def determine_gender(full_name: str, title: str = ""):
    cleaned = re.sub(r'[^a-zA-Z\s]', '', str(full_name)).strip()
    if not cleaned:
        return "male", "Sir"

    lower_full = cleaned.lower()
    
    # Check title cues
    if re.search(r'\b(ms|mrs|miss)\b', lower_full):
        return "female", "Ma'am"
    if re.search(r'\b(mr)\b', lower_full):
        return "male", "Sir"

    parts = cleaned.split()
    first_name = parts[0]
    first_lower = first_name.lower()
    last_name = parts[-1] if len(parts) > 1 else ""
    last_lower = last_name.lower()

    # Surnames that give clear gender cues in India
    if 'kaur' in lower_full.split():
        return "female", "Ma'am"
    if 'singh' in lower_full.split() and 'kaur' not in lower_full.split():
        # Almost always male unless name is explicitly female
        pass

    # Check explicit known lists
    if first_lower in FEMALE_NAMES_WITH_MALE_ENDINGS:
        return "female", "Ma'am"
    if first_lower in MALE_NAMES_WITH_FEMALE_ENDINGS:
        return "male", "Sir"

    # Use gender-guesser library
    guess = d.get_gender(first_name)
    if guess in ('female', 'mostly_female'):
        return "female", "Ma'am"
    if guess in ('male', 'mostly_male'):
        return "male", "Sir"

    # Endings heuristic
    # If ends in traditional female suffixes
    if any(first_lower.endswith(sfx) for sfx in ('ita', 'ika', 'shree', 'priya', 'vathi', 'deepika', 'akanksha', 'akhila', 'akshata', 'pooja', 'neha', 'sneha', 'swati', 'divya', 'shweta', 'tanvi', 'preeti', 'richa', 'pallavi', 'megha', 'shilpa', 'rashmi', 'aarti', 'shruti', 'sonam', 'aditi', 'kavita', 'jyoti', 'sunita', 'chetna', 'shreya', 'tanya', 'ruchi', 'radhika', 'ananya', 'anushka', 'ishita', 'kriti', 'nidhi', 'mansi', 'sakshi', 'simran', 'bhavna', 'monika', 'kanika', 'sonali', 'rupali', 'anjali', 'prachi', 'prerna', 'pragati', 'khushboo')):
        return "female", "Ma'am"

    # General female vowel endings in Indian context
    if first_lower.endswith(('a', 'i', 'ee', 'ti', 'ni', 'ya', 'na', 'ka', 'la', 'da', 'ja')):
        return "female", "Ma'am"

    # Default to male for others
    return "male", "Sir"

def main():
    xlsx_path = "1800 HR email id list.xlsx"
    print(f"Reading {xlsx_path}...")
    df = pd.read_excel(xlsx_path)

    # Filter out empty or footer rows
    df = df[df['Email'].notnull() & ~df['Email'].str.contains('Google', na=False)]
    df = df[df['Name'].notnull()]
    
    contacts = []
    female_count = 0
    male_count = 0

    for idx, row in df.iterrows():
        sno = int(row['SNo']) if pd.notnull(row.get('SNo')) else len(contacts) + 1
        raw_name = str(row['Name']).strip()
        email = str(row['Email']).strip()
        title = str(row['Title']).strip() if pd.notnull(row.get('Title')) else "HR Leader"
        company = str(row['Company']).strip() if pd.notnull(row.get('Company')) else "Company"

        # Clean trailing commas in company e.g. "Estuate," -> "Estuate"
        company = re.sub(r'[\s,]+$', '', company)

        # Extract first name
        name_parts = raw_name.split()
        first_name = name_parts[0] if name_parts else raw_name

        gender, honorific = determine_gender(raw_name, title)
        if gender == "female":
            female_count += 1
        else:
            male_count += 1

        contacts.append({
            "id": sno,
            "name": raw_name,
            "firstName": first_name,
            "email": email,
            "title": title,
            "company": company,
            "gender": gender,
            "honorific": honorific,
            "sent": False,
            "sentAt": None
        })

    print(f"Processed {len(contacts)} contacts.")
    print(f"Gender Breakdown: Male (Sir): {male_count}, Female (Ma'am): {female_count}")

    # 1. Save clean CSV as requested by user
    csv_df = pd.DataFrame(contacts)
    csv_path = "hr_contacts.csv"
    csv_df.to_csv(csv_path, index=False)
    print(f"Saved clean CSV to {csv_path}")

    # 2. Save JSON for React frontend
    os.makedirs("src/data", exist_ok=True)
    json_path = os.path.join("src", "data", "contacts.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(contacts, f, indent=2, ensure_ascii=False)
    print(f"Saved JSON to {json_path}")

    # 3. Initialize sent_status.json if not exists
    status_path = "sent_status.json"
    if not os.path.exists(status_path):
        initial_status = {
            "sentIds": [],
            "customHonorifics": {},
            "lastUpdated": None
        }
        with open(status_path, "w", encoding="utf-8") as f:
            json.dump(initial_status, f, indent=2)
        print(f"Initialized {status_path}")
    else:
        print(f"{status_path} already exists, preserved.")

if __name__ == "__main__":
    main()
