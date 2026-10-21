import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// English text is the key; Bangla falls back to English when a phrase is missing.
const BN = {
  'Emergency Transport, Connected.': 'জরুরি পরিবহন, সংযুক্ত।',
  'With time, beside people': 'সময়ের সাথে, মানুষের পাশে',
  Home: 'হোম', 'My Trips': 'আমার ট্রিপ', Hospitals: 'হাসপাতাল', Profile: 'প্রোফাইল', Earnings: 'আয়',
  SOS: 'SOS', 'Emergency Help': 'জরুরি সাহায্য',
  'Book an Ambulance': 'অ্যাম্বুলেন্স বুক করুন', 'Schedule for Later': 'পরে বুক করুন',
  'Find Hospitals': 'হাসপাতাল খুঁজুন', 'Ambulance services directory': 'অ্যাম্বুলেন্স সেবার তালিকা',
  'ambulances nearby': 'টি অ্যাম্বুলেন্স কাছাকাছি', 'No ambulances online nearby': 'কাছাকাছি কোনো অ্যাম্বুলেন্স অনলাইনে নেই',
  'What is your emergency?': 'আপনার জরুরি অবস্থা কী?',
  'Choose the closest match. We use it to suggest the right hospital and ambulance.':
    'সবচেয়ে কাছাকাছি অবস্থাটি বেছে নিন। এতে সঠিক হাসপাতাল ও অ্যাম্বুলেন্স সাজেস্ট করা হবে।',
  Eye: 'চোখ', Burn: 'পোড়া', 'Road Accident': 'সড়ক দুর্ঘটনা', 'ICU Patient': 'আইসিইউ রোগী',
  Heart: 'হৃদরোগ', Stroke: 'স্ট্রোক', Other: 'অন্যান্য',
  Recommended: 'প্রস্তাবিত', Nearby: 'কাছাকাছি', All: 'সব', 'Map View': 'ম্যাপ', 'List View': 'তালিকা',
  'Search hospitals, area or service': 'হাসপাতাল, এলাকা বা সেবা খুঁজুন',
  'Best match': 'সেরা মিল', Select: 'নির্বাচন', 'Get Directions': 'দিকনির্দেশনা', Call: 'কল', Chat: 'চ্যাট', Share: 'শেয়ার',
  'Book ambulance to here': 'এখানে অ্যাম্বুলেন্স বুক করুন', 'Call hospital': 'হাসপাতালে কল করুন',
  'Pickup & Destination': 'পিকআপ ও গন্তব্য', Pickup: 'পিকআপ', Destination: 'গন্তব্য', Change: 'পরিবর্তন',
  'Use my current location': 'আমার বর্তমান লোকেশন', 'Tap the map to set pickup': 'পিকআপ ঠিক করতে ম্যাপে ট্যাপ করুন',
  'Select Ambulance Type': 'অ্যাম্বুলেন্সের ধরন', 'Basic Transport': 'সাধারণ অ্যাম্বুলেন্স',
  'Oxygen Support': 'অক্সিজেন সাপোর্ট', 'ICU Capable': 'আইসিইউ অ্যাম্বুলেন্স',
  'Nearby ambulances': 'কাছাকাছি অ্যাম্বুলেন্স', Continue: 'চালিয়ে যান', Cancel: 'বাতিল',
  'Fare Summary': 'ভাড়ার সারাংশ', 'Fare Breakdown': 'ভাড়ার বিবরণ', 'Base Fare': 'মূল ভাড়া',
  'Distance Charge': 'দূরত্ব চার্জ', 'Additional Charges': 'অতিরিক্ত চার্জ', 'Total Estimated Fare': 'মোট আনুমানিক ভাড়া',
  'Your offer': 'আপনার প্রস্তাব', 'Payment Method': 'পেমেন্ট পদ্ধতি', Cash: 'ক্যাশ', bKash: 'বিকাশ', Nagad: 'নগদ',
  'Confirm Ambulance Request': 'অ্যাম্বুলেন্স অনুরোধ নিশ্চিত করুন',
  'Finding a Driver': 'চালক খোঁজা হচ্ছে', 'Searching nearby ambulances': 'কাছাকাছি অ্যাম্বুলেন্স খোঁজা হচ্ছে',
  'Checking availability': 'প্রাপ্যতা যাচাই হচ্ছে', 'Matching with a driver': 'চালকের সাথে মিলানো হচ্ছে',
  'Cancel Request': 'অনুরোধ বাতিল', 'Update offer': 'প্রস্তাব আপডেট', Accept: 'গ্রহণ করুন',
  'Trip Tracking': 'ট্রিপ ট্র্যাকিং', 'Driver Information': 'চালকের তথ্য', 'Trip Status': 'ট্রিপের অবস্থা',
  Request: 'অনুরোধ', 'En Route': 'পথে', Arrived: 'পৌঁছেছে', 'Picked Up': 'তুলে নিয়েছে', Completed: 'সম্পন্ন',
  'Emergency Support': 'জরুরি সহায়তা', 'Open in Google Maps': 'গুগল ম্যাপে খুলুন',
  'Request this ambulance': 'এই অ্যাম্বুলেন্সটি চাই', 'Call driver': 'চালককে কল করুন',
  Payment: 'পেমেন্ট', 'Pay now': 'এখন পরিশোধ করুন', 'Rate your trip': 'ট্রিপ রেটিং দিন', Submit: 'জমা দিন', Skip: 'বাদ দিন',
  'Current Trip': 'চলমান ট্রিপ', 'Past Trips': 'আগের ট্রিপ', 'Recent Trips': 'সাম্প্রতিক ট্রিপ',
  Support: 'সহায়তা', 'Report a problem': 'সমস্যা জানান', 'Log out': 'লগ আউট', Language: 'ভাষা',
  'Edit profile': 'প্রোফাইল সম্পাদনা', 'Become a driver': 'চালক হিসেবে যোগ দিন', Save: 'সংরক্ষণ',
  'Sign in': 'সাইন ইন', 'Create account': 'অ্যাকাউন্ট খুলুন', 'Continue with Google': 'Google দিয়ে চালিয়ে যান',
  Email: 'ইমেইল', Password: 'পাসওয়ার্ড', 'Forgot password?': 'পাসওয়ার্ড ভুলে গেছেন?',
  'Full name': 'পূর্ণ নাম', 'Phone number': 'ফোন নম্বর', Gender: 'লিঙ্গ', 'Date of birth': 'জন্ম তারিখ',
  'Blood group': 'রক্তের গ্রুপ', Address: 'ঠিকানা', 'Emergency contact': 'জরুরি যোগাযোগ',
  'Medical notes': 'চিকিৎসা সংক্রান্ত তথ্য', 'Go online': 'অনলাইনে যান', 'Go offline': 'অফলাইনে যান',
  'You are online': 'আপনি অনলাইনে আছেন', 'You are offline': 'আপনি অফলাইনে আছেন',
  'New requests': 'নতুন অনুরোধ', 'Counter offer': 'পাল্টা প্রস্তাব', Decline: 'প্রত্যাখ্যান',
  Navigate: 'নেভিগেট', 'Arrived at pickup': 'পিকআপে পৌঁছেছি', 'Patient picked up': 'রোগী তুলেছি',
  'Complete drop-off': 'ড্রপ সম্পন্ন', 'Confirm payment received': 'পেমেন্ট পেয়েছি',
  'Call 999': '৯৯৯-এ কল করুন', 'Get help now': 'এখনই সাহায্য নিন',
};

const LangCtx = createContext({ lang: 'en', setLang: () => {}, t: (s) => s });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('en');
  useEffect(() => {
    AsyncStorage.getItem('lang').then((v) => v && setLangState(v)).catch(() => {});
  }, []);
  const setLang = useCallback((l) => {
    setLangState(l);
    AsyncStorage.setItem('lang', l).catch(() => {});
  }, []);
  const t = useCallback((s) => (lang === 'bn' && BN[s]) || s, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useT = () => useContext(LangCtx);
