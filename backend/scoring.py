"""
Turns raw assessment answers into:
  - Phone Addiction Risk score (0-100, higher = worse)
  - Sleep Disorder Risk score (0-100, higher = worse)
  - Focus & Mental State score (0-100, higher = worse)
  - Overall Digital Wellness Score (0-100, higher = better)
plus matching labels and personalized recommendations.
"""

PHONE_HOURS_POINTS = {"lt2": 5, "2to4": 30, "4to6": 65, "gt6": 95}
CHECKS_POINTS = {"lt10": 5, "10to30": 35, "30to60": 65, "gt60": 95}
SOCIAL_HOURS_POINTS = {"lt1": 5, "1to3": 35, "3to5": 65, "gt5": 95}

SLEEP_HOURS_POINTS = {"lt5": 90, "5to6": 60, "6to7": 35, "7to8": 10, "gt8": 15}
NIGHT_WAKE_POINTS = {"never": 5, "rarely": 20, "sometimes": 50, "often": 85}
PHONE_BEFORE_BED_POINTS = {"no": 5, "yes": 70}

STRESS_POINTS = {"1": 10, "2": 30, "3": 55, "4": 75, "5": 95}
FOCUS_DIFFICULTY_POINTS = {"1": 10, "2": 30, "3": 55, "4": 75, "5": 95}
EXERCISE_POINTS = {"none": 80, "1to2": 50, "3to4": 25, "5plus": 10}


def _risk_label(score: int) -> str:
    if score < 34:
        return "Low"
    if score < 67:
        return "Moderate"
    return "High"


def _wellness_label(score: int) -> str:
    if score >= 75:
        return "Excellent, keep it up!"
    if score >= 50:
        return "Good, but needs improvement"
    if score >= 30:
        return "At risk, take action"
    return "Needs urgent attention"


def score_assessment(answers: dict) -> dict:
    """answers keys expected:
    phone_hours, phone_checks, social_hours,
    sleep_hours, night_wakes, phone_before_bed,
    stress_level, focus_difficulty, exercise_freq
    """
    phone_sub = [
        PHONE_HOURS_POINTS.get(answers.get("phone_hours"), 50),
        CHECKS_POINTS.get(answers.get("phone_checks"), 50),
        SOCIAL_HOURS_POINTS.get(answers.get("social_hours"), 50),
    ]
    phone_score = round(sum(phone_sub) / len(phone_sub))

    sleep_sub = [
        SLEEP_HOURS_POINTS.get(answers.get("sleep_hours"), 50),
        NIGHT_WAKE_POINTS.get(answers.get("night_wakes"), 50),
        PHONE_BEFORE_BED_POINTS.get(answers.get("phone_before_bed"), 50),
    ]
    sleep_score = round(sum(sleep_sub) / len(sleep_sub))

    focus_sub = [
        STRESS_POINTS.get(str(answers.get("stress_level")), 50),
        FOCUS_DIFFICULTY_POINTS.get(str(answers.get("focus_difficulty")), 50),
        EXERCISE_POINTS.get(answers.get("exercise_freq"), 50),
    ]
    focus_score = round(sum(focus_sub) / len(focus_sub))

    # Overall wellness = inverse of average risk (weighted slightly toward sleep)
    avg_risk = (phone_score * 0.35) + (sleep_score * 0.4) + (focus_score * 0.25)
    wellness_score = round(100 - avg_risk)
    wellness_score = max(0, min(100, wellness_score))

    return {
        "wellness_score": wellness_score,
        "wellness_label": _wellness_label(wellness_score),
        "phone_risk_score": phone_score,
        "phone_risk_label": _risk_label(phone_score),
        "sleep_risk_score": sleep_score,
        "sleep_risk_label": _risk_label(sleep_score),
        "focus_score": focus_score,
        "focus_label": _risk_label(focus_score),
    }



    parts = []

    if result["phone_risk_score"] >= 67:
        parts.append("very high phone usage")
    elif result["phone_risk_score"] >= 34:
        parts.append("moderate phone usage")

    if result["sleep_risk_score"] >= 67:
        parts.append("poor sleep patterns, possibly including late night screen time")
    elif result["sleep_risk_score"] >= 34:
        parts.append("somewhat irregular sleep")

    if result["focus_score"] >= 67:
        parts.append("high stress with noticeable focus difficulty")
    elif result["focus_score"] >= 34:
        parts.append("some difficulty focusing")

    if not parts:
        return (
            "Your responses show healthy digital habits and consistent sleep. "
            "Keep up the balance you've built, it's clearly working."
        )

    body = ", ".join(parts)
    return (
        f"Your responses indicate {body}. This combination can lead to tiredness "
        "and lower focus during the day. Reducing screen time, especially at night, "
        "can help you sleep better and feel more energetic."
    )


def build_recommendations(result: dict) -> list:
    recs = []

    if result["sleep_risk_score"] >= 34:
        recs.append({
            "title": "Sleep Better",
            "icon": "moon",
            "tips": [
                "Avoid phone use 1 hour before bed",
                "Try to sleep and wake up at the same time daily",
                "Create a relaxing bedtime routine",
            ],
        })
    else:
        recs.append({
            "title": "Sleep Better",
            "icon": "moon",
            "tips": [
                "Keep up your consistent sleep schedule",
                "Maintain a screen-free wind-down routine",
                "Track your sleep to stay consistent",
            ],
        })

    if result["phone_risk_score"] >= 34:
        recs.append({
            "title": "Reduce Phone Usage",
            "icon": "phone",
            "tips": [
                "Set daily screen time limits",
                "Turn off unnecessary notifications",
                "Use focus mode while studying or working",
            ],
        })
    else:
        recs.append({
            "title": "Reduce Phone Usage",
            "icon": "phone",
            "tips": [
                "Keep your mindful usage habits",
                "Do occasional digital detox days",
                "Review app usage stats weekly",
            ],
        })

    if result["focus_score"] >= 34:
        recs.append({
            "title": "Improve Focus",
            "icon": "target",
            "tips": [
                "Use the Pomodoro technique (25 min focus + 5 min break)",
                "Take short walks or do stretching",
                "Do mindfulness or breathing exercises",
            ],
        })
    else:
        recs.append({
            "title": "Improve Focus",
            "icon": "target",
            "tips": [
                "Keep practicing focused work blocks",
                "Continue mindfulness and breathing exercises",
                "Protect your peak-focus hours",
            ],
        })

    return recs
