import os
import re
import shutil

# Config
langs = ['en', 'bn', 'de', 'es', 'zh', 'ja']
pages_map = {
    'index': 'home',
    'founder': 'ruhan',
    'pathfinder': 'pathfinder',
    'trambulance': 'trambulance',
    'blog': 'blog',
    'contact': 'contact',
    'resources': 'resources',
    'privacy': 'privacy',
    'metadata': 'metadata'
}

# Extensive Translation Database
t_db = {
    # Navigation & General
    "HOME": {"de": "STARTSEITE", "es": "INICIO", "zh": "首页", "ja": "ホーム"},
    "ABOUT US": {"de": "ÜBER UNS", "es": "NOSOTROS", "zh": "关于我们", "ja": "私たちについて"},
    "ENGINEERING": {"de": "TECHNIK", "es": "INGENIERÍA", "zh": "工程", "ja": "エンジニアリング"},
    "PRODUCTS": {"de": "PRODUKTE", "es": "PRODUCTOS", "zh": "产品", "ja": "製品"},
    "PRODUCT MODELS": {"de": "PRODUKTMODELLE", "es": "MODELOS DE PRODUCTOS", "zh": "产品型号", "ja": "製品モデル"},
    "WHY US": {"de": "WARUM WIR", "es": "POR QUÉ NOSOTROS", "zh": "为什么选择我们", "ja": "選ばれる理由"},
    "FOUNDERS": {"de": "GRÜNDER", "es": "FUNDADORES", "zh": "创始人", "ja": "創業者"},
    "CONTACTS": {"de": "KONTAKT", "es": "CONTACTO", "zh": "联系方式", "ja": "お問い合わせ"},
    "TRAMBULANCE": {"de": "TRAMBULANZ", "es": "TRAMBULANCIA", "zh": "救护车", "ja": "トランビュランス"},
    "NOTICE BOARD": {"de": "SCHWARZES BRETT", "es": "TABLÓN DE ANUNCIOS", "zh": "公告板", "ja": "掲示板"},
    
    # Ruhan / Founder Page
    "Professional Portfolio of": {"de": "Professionelles Portfolio von", "es": "Portafolio Profesional de", "zh": "专业作品集", "ja": "プロフェッショナルポートフォリオ"},
    "ROWNAK": {"de": "ROWNAK", "es": "ROWNAK", "zh": "ROWNAK", "ja": "ROWNAK"},
    "SHAHRIAR": {"de": "SHAHRIAR", "es": "SHAHRIAR", "zh": "SHAHRIAR", "ja": "SHAHRIAR"},
    "RUHAN": {"de": "RUHAN", "es": "RUHAN", "zh": "RUHAN", "ja": "RUHAN"},
    "Founder of TriChokro. Mechanical Engineering Student at BUET. ": {"de": "Gründer von TriChokro. Maschinenbaustudent an der BUET.", "es": "Fundador de TriChokro. Estudiante de Ingeniería Mecánica en BUET.", "zh": "TriChokro 创始人。BUET 机械工程专业学生。", "ja": "TriChokro の創設者。BUET の機械工学学生。"},
    "Visit Resume": {"de": "Lebenslauf ansehen", "es": "Ver Currículum", "zh": "查看简历", "ja": "履歴書を見る"},
    "Professional Experiences": {"de": "Berufserfahrung", "es": "Experiencia Profesional", "zh": "专业经验", "ja": "職務経験"},
    "Founder & CEO": {"de": "Gründer & CEO", "es": "Fundador y CEO", "zh": "创始人兼首席执行官", "ja": "創業者兼CEO"},
    "Leading a Govt. funded startup to manufacture Electric Easy Bike, Tri-Wheelers.": {"de": "Leitung eines staatlich geförderten Startups zur Herstellung von elektrischen Easy Bikes und Dreirädern.", "es": "Liderando una startup financiada por el gobierno para fabricar bicicletas eléctricas y triciclos.", "zh": "领导一家政府资助的初创公司，制造电动简易自行车和三轮车。", "ja": "政府資金によるスタートアップを率いて、電動イージーバイク、三輪車を製造。"},
    "Start-up Leadership": {"de": "Startup-Führung", "es": "Liderazgo de Startup", "zh": "创业领导力", "ja": "スタートアップのリーダーシップ"},
    "EV Design": {"de": "EV-Design", "es": "Diseño de VE", "zh": "电动汽车设计", "ja": "EVデザイン"},
    "Govt. Funded": {"de": "Staatlich gefördert", "es": "Financiado por el Gobierno", "zh": "政府资助", "ja": "政府資金提供"},
    "BYD Bangladesh": {"de": "BYD Bangladesch", "es": "BYD Bangladesh", "zh": "比亚迪孟加拉", "ja": "BYD バングラデシュ"},
    "1 month Internship Trainee": {"de": "1 Monat Praktikum", "es": "Pasante de 1 mes", "zh": "1个月实习生", "ja": "1ヶ月インターンシップ研修生"},
    "1 month training on Manufacturing, Business & Supply Chain.": {"de": "1 Monat Training in Fertigung, Business & Supply Chain.", "es": "1 mes de capacitación en Manufactura, Negocios y Cadena de Suministro.", "zh": "1个月的制造、商业和供应链培训。", "ja": "製造、ビジネス、サプライチェーンに関する1ヶ月のトレーニング。"},
    "Manufacturing": {"de": "Fertigung", "es": "Manufactura", "zh": "制造", "ja": "製造"},
    "Business Analysis": {"de": "Geschäftsanalyse", "es": "Análisis de Negocios", "zh": "商业分析", "ja": "ビジネス分析"},
    "Supply Chain": {"de": "Lieferkette", "es": "Cadena de Suministro", "zh": "供应链", "ja": "サプライチェーン"},
    "Rahim Afrooz Battery": {"de": "Rahim Afrooz Batterie", "es": "Batería Rahim Afrooz", "zh": "Rahim Afrooz 电池", "ja": "Rahim Afrooz バッテリー"},
    "Academic Internship": {"de": "Akademisches Praktikum", "es": "Pasantía Académica", "zh": "学术实习", "ja": "アカデミックインターンシップ"},
    "Battery Manufacturing and Maintenance.": {"de": "Batterieherstellung und Wartung.", "es": "Fabricación y Mantenimiento de Baterías.", "zh": "电池制造与维护。", "ja": "バッテリー製造とメンテナンス。"},
    "Battery Technology": {"de": "Batterietechnologie", "es": "Tecnología de Baterías", "zh": "电池技术", "ja": "バッテリー技術"},
    "Maintenance Procedure": {"de": "Wartungsverfahren", "es": "Procedimiento de Mantenimiento", "zh": "维护程序", "ja": "メンテナンス手順"},
    "Ronograph": {"de": "Ronograph", "es": "Ronograph", "zh": "Ronograph", "ja": "Ronograph"},
    "Founder & Chief Photographer": {"de": "Gründer & Chef-Fotograf", "es": "Fundador y Fotógrafo Principal", "zh": "创始人兼首席摄影师", "ja": "創設者兼チーフフォトグラファー"},
    "Photographic agency and instruction (2024).": {"de": "Fotoagentur und Unterricht (2024).", "es": "Agencia fotográfica e instrucción (2024).", "zh": "摄影机构与教学 (2024)。", "ja": "写真代理店および指導 (2024)。"},
    "Wikimedia BD": {"de": "Wikimedia BD", "es": "Wikimedia BD", "zh": "维基媒体 BD", "ja": "ウィキメディア BD"},
    "Executive Member, Reviewer": {"de": "Vorstandsmitglied, Gutachter", "es": "Miembro Ejecutivo, Revisor", "zh": "执行成员，审稿人", "ja": "執行メンバー、査読者"},
    "Reviewer, Rollbacker, Jury for Bangla/English Wikipedia.": {"de": "Gutachter, Rollbacker, Jury für Bangla/Englisch Wikipedia.", "es": "Revisor, Reversor, Jurado para Wikipedia en Bangla/Inglés.", "zh": "孟加拉语/英语维基百科的审稿人、回退员、评委。", "ja": "ベンガル語/英語ウィキペディアの査読者、ロールバッカー、審査員。"},
    "Ankur International": {"de": "Ankur International", "es": "Ankur International", "zh": "Ankur 国际", "ja": "Ankur International"},
    "Publicity Secretary & Project Head": {"de": "Sekretär für Öffentlichkeitsarbeit & Projektleiter", "es": "Secretario de Publicidad y Jefe de Proyecto", "zh": "宣传秘书兼项目负责人", "ja": "広報秘書兼プロジェクト責任者"},
    "Curriculum Vitae 📜": {"de": "Lebenslauf 📜", "es": "Currículum Vitae 📜", "zh": "简历 📜", "ja": "履歴書 📜"},
    "A glimps of his professional history": {"de": "Ein Einblick in seinen beruflichen Werdegang", "es": "Un vistazo a su historia profesional", "zh": "他的职业生涯一瞥", "ja": "彼の職業経歴を垣間見る"},
    "Mechanical Engineering Student (BUET)": {"de": "Maschinenbaustudent (BUET)", "es": "Estudiante de Ingeniería Mecánica (BUET)", "zh": "机械工程学生 (BUET)", "ja": "機械工学学生 (BUET)"},
    "Major in Automobile Engineering": {"de": "Hauptfach Automobiltechnik", "es": "Especialidad en Ingeniería Automotriz", "zh": "主修汽车工程", "ja": "自動車工学専攻"},
    "Education 🎓": {"de": "Bildung 🎓", "es": "Educación 🎓", "zh": "教育 🎓", "ja": "教育 🎓"},
    "B.Sc. in Mechanical Engineering": {"de": "B.Sc. in Maschinenbau", "es": "Licenciatura en Ingeniería Mecánica", "zh": "机械工程理学学士", "ja": "機械工学の理学士"},
    "BUET (2021-2026)": {"de": "BUET (2021-2026)", "es": "BUET (2021-2026)", "zh": "BUET (2021-2026)", "ja": "BUET (2021-2026)"},
    "4th Year, Last Semester": {"de": "4. Jahr, letztes Semester", "es": "4º Año, Último Semestre", "zh": "第四年，上一学期", "ja": "4年、最終学期"},
    "Higher Secondary Certificate": {"de": "Abitur", "es": "Certificado de Secundaria Superior", "zh": "高中毕业证书", "ja": "高等中等教育修了証"},
    "Notre Dame College (2018-2020)": {"de": "Notre Dame College (2018-2020)", "es": "Notre Dame College (2018-2020)", "zh": "圣母学院 (2018-2020)", "ja": "ノートルダムカレッジ (2018-2020)"},
    "GPA-5 with Scholarship": {"de": "GPA-5 mit Stipendium", "es": "GPA-5 con Beca", "zh": "GPA-5 获奖学金", "ja": "奨学金付きGPA-5"},
    "Science Group-1": {"de": "Wissenschaftsgruppe-1", "es": "Grupo de Ciencias-1", "zh": "科学组-1", "ja": "科学グループ-1"},
    "Secondary School Certificate": {"de": "Mittlere Reife", "es": "Certificado de Escuela Secundaria", "zh": "中学毕业证书", "ja": "中等教育修了証"},
    "Adarsha High School (2013-2018)": {"de": "Adarsha High School (2013-2018)", "es": "Adarsha High School (2013-2018)", "zh": "Adarsha 高中 (2013-2018)", "ja": "Adarsha 高校 (2013-2018)"},
    "GPA-5, Talentpool Scholarship": {"de": "GPA-5, Talentpool-Stipendium", "es": "GPA-5, Beca Talentpool", "zh": "GPA-5, 人才库奖学金", "ja": "GPA-5, タレントプール奨学金"},
    "2014 Student of the Year": {"de": "Schüler des Jahres 2014", "es": "Estudiante del Año 2014", "zh": "2014年度学生", "ja": "2014年最優秀学生"},
    "Software Skills 💻": {"de": "Software-Kenntnisse 💻", "es": "Habilidades de Software 💻", "zh": "软件技能 💻", "ja": "ソフトウェアスキル 💻"},
    "Expertise 🛠️": {"de": "Fachwissen 🛠️", "es": "Experiencia 🛠️", "zh": "专长 🛠️", "ja": "専門知識 🛠️"},
    "Hardware Manufacturing": {"de": "Hardware-Fertigung", "es": "Fabricación de Hardware", "zh": "硬件制造", "ja": "ハードウェア製造"},
    "Production Optimization": {"de": "Produktionsoptimierung", "es": "Optimización de Producción", "zh": "生产优化", "ja": "生産最適化"},
    "Profile 👤": {"de": "Profil 👤", "es": "Perfil 👤", "zh": "简介 👤", "ja": "プロフィール 👤"},
    "Achievements 🏆": {"de": "Erfolge 🏆", "es": "Logros 🏆", "zh": "成就 🏆", "ja": "成果 🏆"},
    "National Champion | SofE": {"de": "Nationaler Meister | SofE", "es": "Campeón Nacional | SofE", "zh": "全国冠军 | SofE", "ja": "ナショナルチャンピオン | SofE"},
    "Nov 2025": {"de": "Nov 2025", "es": "Nov 2025", "zh": "2025年11月", "ja": "2025年11月"},
    "Speak Out for Engineers (IMechE)": {"de": "Speak Out for Engineers (IMechE)", "es": "Speak Out for Engineers (IMechE)", "zh": "为工程师发声 (IMechE)", "ja": "エンジニアのために声を上げる (IMechE)"},
    "Project Trambulance: Innovated an efficiently designed, affordable Tri-wheeled Battery-Powered Ambulance.": {"de": "Projekt Trambulance: Innovation einer effizient gestalteten, erschwinglichen dreirädrigen batteriebetriebenen Ambulanz.", "es": "Proyecto Trambulance: Innovación de una ambulancia eléctrica de tres ruedas, diseñada eficientemente y asequible.", "zh": "Trambulance 项目：创新了一种设计高效、价格实惠的三轮电池驱动救护车。", "ja": "プロジェクト・トランビュランス：効率的に設計された手頃な価格の三輪バッテリー駆動救急車を革新しました。"},
    "Conducted 3D design in SolidWorks/SketchUp with Aerodynamic and Load Simulations in Ansys.": {"de": "Durchführung von 3D-Design in SolidWorks/SketchUp mit Aerodynamik- und Belastungssimulationen in Ansys.", "es": "Realizó diseño 3D en SolidWorks/SketchUp con simulaciones aerodinámicas y de carga en Ansys.", "zh": "在 SolidWorks/SketchUp 中进行 3D 设计，并在 Ansys 中进行空气动力学和负载模拟。", "ja": "SolidWorks/SketchUp で 3D 設計を行い、Ansys で空力および荷重シミュレーションを実施しました。"},
    "Innovative Chassis and Aerodynamic Origami inspired Hood System earned appreciation.": {"de": "Innovatives Chassis und aerodynamisches, Origami-inspiriertes Verdecksystem wurden gewürdigt.", "es": "El chasis innovador y el sistema de capota inspirado en Origami aerodinámico obtuvieron reconocimiento.", "zh": "创新底盘和受折纸启发的空气动力学车篷系统获得了赞赏。", "ja": "革新的なシャーシと空気力学に基づいた折り紙風のフードシステムが評価されました。"},
    "BUET Champion | UIHP": {"de": "BUET Meister | UIHP", "es": "Campeón BUET | UIHP", "zh": "BUET 冠军 | UIHP", "ja": "BUET チャンピオン | UIHP"},
    "July 2025": {"de": "Juli 2025", "es": "Julio 2025", "zh": "2025年7月", "ja": "2025年7月"},
    "University Innovation Hub Program (ICT Division)": {"de": "University Innovation Hub Program (ICT Division)", "es": "Programa de Centro de Innovación Universitaria (División TIC)", "zh": "大学创新中心计划（ICT部门）", "ja": "大学イノベーションハブプログラム（ICT部門）"},
    "Project TriChokro: Developed an improved and affordable Auto-Rickshaw Model.Inspired by Prof Ehsan's BUET-BPERC Easy Bike Project.": {"de": "Projekt TriChokro: Entwicklung eines verbesserten und erschwinglichen Auto-Rikscha-Modells. Inspiriert von Prof. Ehsans BUET-BPERC Easy Bike Projekt.", "es": "Proyecto TriChokro: Desarrolló un modelo de Auto-Rickshaw mejorado y asequible. Inspirado en el Proyecto Easy Bike BUET-BPERC del Prof. Ehsan.", "zh": "TriChokro 项目：开发了一种改进且价格实惠的自动人力车模型。受 Ehsan 教授的 BUET-BPERC 简易自行车项目启发。", "ja": "プロジェクト TriChokro：改良された手頃な価格のオートリキシャモデルを開発しました。Ehsan 教授の BUET-BPERC イージーバイクプロジェクトに触発されました。"},
    "Prototype built; mass production deal in progress with help of Metrocem Automobile.": {"de": "Prototyp gebaut; Massenproduktionsabkommen mit Hilfe von Metrocem Automobile in Arbeit.", "es": "Prototipo construido; acuerdo de producción en masa en progreso con la ayuda de Metrocem Automobile.", "zh": "原型已建成；在 Metrocem Automobile 的帮助下，大规模生产协议正在进行中。", "ja": "プロトタイプが完成しました。Metrocem Automobile の協力を得て量産取引が進行中です。"},
    "Secured funding from BUET Alumni and Investors.": {"de": "Finanzierung von BUET-Alumni und Investoren gesichert.", "es": "Financiación asegurada de exalumnos e inversores de BUET.", "zh": "获得了 BUET 校友和投资者的资金。", "ja": "BUET の卒業生と投資家から資金を確保しました。"},
    "Entrepreneurial Experience 💼": {"de": "Unternehmerische Erfahrung 💼", "es": "Experiencia Emprendedora 💼", "zh": "创业经验 💼", "ja": "起業家経験 💼"},
    "Registered Manufacturing Startup (BIDA & Government License)": {"de": "Registriertes Fertigungs-Startup (BIDA & Regierungslizenz)", "es": "Startup de Manufactura Registrada (BIDA y Licencia Gubernamental)", "zh": "注册制造初创公司（BIDA 和政府许可证）", "ja": "登録製造スタートアップ（BIDA および政府ライセンス）"},
    "Collaborators: Prof. Md. Ehsan (BUET), Abdul Jawad (PhD, UCSC), Ishraq Rafid (MS, Germany).": {"de": "Mitarbeiter: Prof. Md. Ehsan (BUET), Abdul Jawad (PhD, UCSC), Ishraq Rafid (MS, Deutschland).", "es": "Colaboradores: Prof. Md. Ehsan (BUET), Abdul Jawad (PhD, UCSC), Ishraq Rafid (MS, Alemania).", "zh": "合作者：Md. Ehsan 教授 (BUET)，Abdul Jawad (博士, UCSC)，Ishraq Rafid (硕士, 德国)。", "ja": "共同研究者：Md. Ehsan 教授 (BUET)、Abdul Jawad (博士, UCSC)、Ishraq Rafid (修士, ドイツ)。"},
    "Work Experience": {"de": "Berufserfahrung", "es": "Experiencia Laboral", "zh": "工作经验", "ja": "職務経験"},
    "Industrial Training": {"de": "Industrielle Ausbildung", "es": "Formación Industrial", "zh": "工业培训", "ja": "産業実習"},
    "Rahim Afrooz Battery & Accumulators 🚗": {"de": "Rahim Afrooz Batterie & Akkumulatoren 🚗", "es": "Baterías y Acumuladores Rahim Afrooz 🚗", "zh": "Rahim Afrooz 电池与蓄电池 🚗", "ja": "Rahim Afrooz バッテリー＆アキュムレータ 🚗"},
    "Academic Internship": {"de": "Akademisches Praktikum", "es": "Pasantía Académica", "zh": "学术实习", "ja": "アカデミックインターンシップ"},
    "Wikimedia Bangladesh": {"de": "Wikimedia Bangladesch", "es": "Wikimedia Bangladesh", "zh": "维基媒体孟加拉", "ja": "ウィキメディア バングラデシュ"},
    "Executive Member": {"de": "Vorstandsmitglied", "es": "Miembro Ejecutivo", "zh": "执行成员", "ja": "執行メンバー"},
    "References 🤝": {"de": "Referenzen 🤝", "es": "Referencias 🤝", "zh": "参考 🤝", "ja": "参照 🤝"},
    "Associate Professor, Department of Mechanical Engineering, BUET": {"de": "Außerordentlicher Professor, Abteilung für Maschinenbau, BUET", "es": "Profesor Asociado, Departamento de Ingeniería Mecánica, BUET", "zh": "BUET 机械工程系副教授", "ja": "BUET 機械工学科准教授"},
    "Professor, Department of Mechanical Engineering, BUET": {"de": "Professor, Abteilung für Maschinenbau, BUET", "es": "Profesor, Departamento de Ingeniería Mecánica, BUET", "zh": "BUET 机械工程系教授", "ja": "BUET 機械工学科教授"},
    "2016 - Present": {"de": "2016 - Heute", "es": "2016 - Presente", "zh": "2016 - 至今", "ja": "2016 - 現在"},
    "2021 - Present": {"de": "2021 - Heute", "es": "2021 - Presente", "zh": "2021 - 至今", "ja": "2021 - 現在"},
    "Nov 2025 - Present": {"de": "Nov 2025 - Heute", "es": "Nov 2025 - Presente", "zh": "2025年11月 - 至今", "ja": "2025年11月 - 現在"},
    
    # Pathfinder / Models
    "The Current Crisis ⚠️": {"de": "Die aktuelle Krise ⚠️", "es": "La Crisis Actual ⚠️", "zh": "当前的危机 ⚠️", "ja": "現在の危機 ⚠️"},
    "Unsafe electric rickshaws have flooded Dhaka's roads, causing accidents and environmental hazards. We identified three critical failure points 📉.": {"de": "Unsichere elektrische Rikschas haben Dhakas Straßen überschwemmt und verursachen Unfälle und Umweltgefahren. Wir haben drei kritische Fehlerpunkte identifiziert 📉.", "es": "Los rickshaws eléctricos inseguros han inundado las carreteras de Dhaka, causando accidentes y peligros ambientales. Identificamos tres puntos críticos de falla 📉.", "zh": "不安全的电动人力车充斥着达卡的道路，造成事故和环境危害。我们确定了三个关键故障点 📉。", "ja": "安全でない電気リキシャがダッカの道路に溢れ、事故や環境被害を引き起こしています。3つの重要な失敗点を特定しました 📉。"},
    "Safety Hazards": {"de": "Sicherheitsrisiken", "es": "Riesgos de Seguridad", "zh": "安全隐患", "ja": "安全上の危険"},
    "Non-existent braking systems": {"de": "Nicht vorhandene Bremssysteme", "es": "Sistemas de frenado inexistentes", "zh": "不存在的制动系统", "ja": "存在しないブレーキシステム"},
    "High center of gravity (tipping risk)": {"de": "Hoher Schwerpunkt (Kippgefahr)", "es": "Alto centro de gravedad (riesgo de vuelco)", "zh": "重心高（倾覆风险）", "ja": "重心が高い（転倒リスク）"},
    "Poor suspension causing injury": {"de": "Schlechte Federung verursacht Verletzungen", "es": "Mala suspensión causando lesiones", "zh": "悬挂不良导致受伤", "ja": "サスペンションが悪く怪我の原因となる"},
    "Engineering Faults": {"de": "Technische Mängel", "es": "Fallas de Ingeniería", "zh": "工程故障", "ja": "エンジニアリングの欠陥"},
    "High aerodynamic drag": {"de": "Hoher Luftwiderstand", "es": "Alta resistencia aerodinámica", "zh": "高空气阻力", "ja": "高い空力抗力"},
    "Low load capacity wheels": {"de": "Räder mit geringer Tragfähigkeit", "es": "Ruedas de baja capacidad de carga", "zh": "低负载能力车轮", "ja": "低負荷容量ホイール"},
    "Inferior structural materials": {"de": "Minderwertige Strukturmaterialien", "es": "Materiales estructurales inferiores", "zh": "劣质结构材料", "ja": "劣悪な構造材料"},
    "Environmental Impact": {"de": "Umweltauswirkungen", "es": "Impacto Ambiental", "zh": "环境影响", "ja": "環境への影響"},
    "Non-recyclable toxic batteries": {"de": "Nicht recycelbare giftige Batterien", "es": "Baterías tóxicas no reciclables", "zh": "不可回收的有毒电池", "ja": "リサイクル不可能な有毒バッテリー"},
    "Industrial waste from imports": {"de": "Industrieabfälle aus Importen", "es": "Residuos industriales de importaciones", "zh": "进口工业废物", "ja": "輸入による産業廃棄物"},
    "Noise pollution from old engines": {"de": "Lärmbelästigung durch alte Motoren", "es": "Contaminación acústica de motores viejos", "zh": "旧发动机的噪音污染", "ja": "古いエンジンによる騒音公害"},
    "The Solution 💡": {"de": "Die Lösung 💡", "es": "La Solución 💡", "zh": "解决方案 💡", "ja": "解決策 💡"},
    "Engineering excellence meets local innovation 🛠️.": {"de": "Ingenieurskunst trifft lokale Innovation 🛠️.", "es": "La excelencia en ingeniería se une a la innovación local 🛠️.", "zh": "卓越工程遇上本地创新 🛠️。", "ja": "卓越したエンジニアリングと地域のイノベーションの出会い 🛠️。"},
    "BUET Innovated": {"de": "BUET Innoviert", "es": "Innovado por BUET", "zh": "BUET 创新", "ja": "BUET イノベーション"},
    "McPherson Suspension": {"de": "McPherson-Federung", "es": "Suspensión McPherson", "zh": "麦弗逊悬挂", "ja": "マクファーソンサスペンション"},
    "Superior ride comfort and stability compared to traditional leaf springs.": {"de": "Überlegener Fahrkomfort und Stabilität im Vergleich zu herkömmlichen Blattfedern.", "es": "Comodidad de conducción y estabilidad superiores en comparación con las ballestas tradicionales.", "zh": "与传统板簧相比，具有卓越的乘坐舒适性和稳定性。", "ja": "従来のリーフスプリングと比較して優れた乗り心地と安定性。"},
    "Disc Brakes": {"de": "Scheibenbremsen", "es": "Frenos de Disco", "zh": "盘式制动器", "ja": "ディスクブレーキ"},
    "Modern hydraulic disc brakes replacing dangerous rubber pad brakes.": {"de": "Moderne hydraulische Scheibenbremsen ersetzen gefährliche Gummibelagbremsen.", "es": "Frenos de disco hidráulicos modernos que reemplazan los peligrosos frenos de almohadilla de goma.", "zh": "现代液压盘式制动器取代危险的橡胶垫制动器。", "ja": "危険なゴムパッドブレーキに代わる最新の油圧ディスクブレーキ。"},
    "Optimized hood and body to reduce drag and increase battery efficiency.": {"de": "Optimierte Motorhaube und Karosserie zur Reduzierung des Luftwiderstands und Erhöhung der Batterieeffizienz.", "es": "Capó y carrocería optimizados para reducir la resistencia y aumentar la eficiencia de la batería.", "zh": "优化的车篷和车身以减少阻力并提高电池效率。", "ja": "ドラッグを減らしバッテリー効率を高めるために最適化されたフードとボディ。"},
    "Eco-Sustainable": {"de": "Öko-Nachhaltig", "es": "Eco-Sostenible", "zh": "生态可持续", "ja": "環境持続可能"},
    "Recyclable components and battery technology that is not harmful to the environment.": {"de": "Recycelbare Komponenten und Batterietechnologie, die nicht umweltschädlich ist.", "es": "Componentes reciclables y tecnología de baterías que no es dañina para el medio ambiente.", "zh": "可回收组件和对环境无害的电池技术。", "ja": "リサイクル可能なコンポーネントと環境に無害なバッテリー技術。"},
    "Market Comparison": {"de": "Marktvergleich", "es": "Comparación de Mercado", "zh": "市场比较", "ja": "市場比較"},
    "Feature": {"de": "Merkmal", "es": "Característica", "zh": "特征", "ja": "特徴"},
    "Typical Auto Rickshaw": {"de": "Typische Auto-Rikscha", "es": "Auto Rickshaw Típico", "zh": "典型自动人力车", "ja": "一般的なオートリキシャ"},
    "CNG": {"de": "CNG", "es": "GNC", "zh": "CNG", "ja": "CNG"},
    "Cost (BDT)": {"de": "Kosten (BDT)", "es": "Costo (BDT)", "zh": "成本 (BDT)", "ja": "コスト (BDT)"},
    "Braking": {"de": "Bremsen", "es": "Frenado", "zh": "制动", "ja": "ブレーキ"},
    "Rubber/Drum (Unsafe)": {"de": "Gummi/Trommel (Unsicher)", "es": "Goma/Tambor (Inseguro)", "zh": "橡胶/鼓式（不安全）", "ja": "ゴム/ドラム（危険）"},
    "Disc Brake": {"de": "Scheibenbremse", "es": "Freno de Disco", "zh": "盘式制动", "ja": "ディスクブレーキ"},
    "Disc Brake (Safe)": {"de": "Scheibenbremse (Sicher)", "es": "Freno de Disco (Seguro)", "zh": "盘式制动（安全）", "ja": "ディスクブレーキ（安全）"},
    "Safety Level": {"de": "Sicherheitsniveau", "es": "Nivel de Seguridad", "zh": "安全级别", "ja": "安全レベル"},
    "Medium Risk": {"de": "Mittleres Risiko", "es": "Riesgo Medio", "zh": "中等风险", "ja": "中リスク"},
    "High Safety": {"de": "Hohe Sicherheit", "es": "Alta Seguridad", "zh": "高安全性", "ja": "高安全性"},
    "Seat Capacity": {"de": "Sitzplatzkapazität", "es": "Capacidad de Asientos", "zh": "座位容量", "ja": "座席定員"},
    "Product Lineup": {"de": "Produktpalette", "es": "Línea de Productos", "zh": "产品阵容", "ja": "製品ラインナップ"},
    "Designed for every road and every need.": {"de": "Entwickelt für jede Straße und jeden Bedarf.", "es": "Diseñado para cada camino y cada necesidad.", "zh": "专为每条道路和每个需求而设计。", "ja": "あらゆる道路とあらゆるニーズのために設計されています。"},
    "Base Model": {"de": "Basismodell", "es": "Modelo Base", "zh": "基本型号", "ja": "ベースモデル"},
    "1.8 Lakh": {"de": "1,8 Lakh", "es": "1.8 Lakh", "zh": "1.8 Lakh", "ja": "1.8 Lakh"},
    "Standard Suspension": {"de": "Standardfederung", "es": "Suspensión Estándar", "zh": "标准悬挂", "ja": "標準サスペンション"},
    "Urban Commute Ready": {"de": "Bereit für den Stadtverkehr", "es": "Listo para el Viaje Urbano", "zh": "城市通勤就绪", "ja": "都市通勤対応"},
    "Weather Sealed": {"de": "Wetterfest", "es": "Sellado contra el Clima", "zh": "全天候密封", "ja": "全天候型"},
    "2.0 Lakh": {"de": "2,0 Lakh", "es": "2.0 Lakh", "zh": "2.0 Lakh", "ja": "2.0 Lakh"},
    "IP69 Rated Protection": {"de": "IP69-Schutz", "es": "Protección Clasificada IP69", "zh": "IP69 级保护", "ja": "IP69 定格保護"},
    "Reliable in Monsoon": {"de": "Zuverlässig im Monsun", "es": "Confiable en el Monzón", "zh": "季风季节可靠", "ja": "モンスーンでも信頼できる"},
    "CNG Alternative": {"de": "CNG-Alternative", "es": "Alternativa GNC", "zh": "CNG 替代品", "ja": "CNG 代替"},
    "2.5 Lakh": {"de": "2,5 Lakh", "es": "2.5 Lakh", "zh": "2.5 Lakh", "ja": "2.5 Lakh"},
    "High Speed Range": {"de": "Hochgeschwindigkeitsbereich", "es": "Rango de Alta Velocidad", "zh": "高速范围", "ja": "高速レンジ"},
    "Extended Battery": {"de": "Erweiterte Batterie", "es": "Batería Extendida", "zh": "扩展电池", "ja": "拡張バッテリー"},
    "All Terrain": {"de": "Geländegängig", "es": "Todo Terreno", "zh": "全地形", "ja": "全地形"},
    "3.0 Lakh": {"de": "3,0 Lakh", "es": "3.0 Lakh", "zh": "3.0 Lakh", "ja": "3.0 Lakh"},
    "Reinforced Frame": {"de": "Verstärkter Rahmen", "es": "Marco Reforzado", "zh": "加固框架", "ja": "強化フレーム"},
    "Heavy Duty Suspension": {"de": "Schwerlastfederung", "es": "Suspensión de Alta Resistencia", "zh": "重型悬挂", "ja": "ヘビーデューティサスペンション"},
    "Market Potential": {"de": "Marktpotenzial", "es": "Potencial de Mercado", "zh": "市场潜力", "ja": "市場の可能性"},
    "Total Addressable Market (Dhaka)": {"de": "Gesamtmarkt (Dhaka)", "es": "Mercado Total Direccionable (Dhaka)", "zh": "总可寻址市场（达卡）", "ja": "総獲得可能市場（ダッカ）"},
    "2,400 Cr BDT": {"de": "2.400 Cr BDT", "es": "2,400 Cr BDT", "zh": "240 亿 BDT", "ja": "2,400 Cr BDT"},
    "Target Share (2 Years)": {"de": "Zielanteil (2 Jahre)", "es": "Cuota Objetivo (2 Años)", "zh": "目标份额（2年）", "ja": "目標シェア（2年）"},
    "1.5 Lakh": {"de": "1,5 Lakh", "es": "1.5 Lakh", "zh": "1.5 Lakh", "ja": "1.5 Lakh"},
    "Vehicles in Dhaka": {"de": "Fahrzeuge in Dhaka", "es": "Vehículos en Dhaka", "zh": "达卡的车辆", "ja": "ダッカの車両"},
    "1.29 Lakh": {"de": "1,29 Lakh", "es": "1.29 Lakh", "zh": "1.29 Lakh", "ja": "1.29 Lakh"},
    "Production Cost": {"de": "Produktionskosten", "es": "Costo de Producción", "zh": "生产成本", "ja": "生産コスト"},
    "5 Year Profit Projection 📈": {"de": "5-Jahres-Gewinnprognose 📈", "es": "Proyección de Ganancias a 5 Años 📈", "zh": "5年利润预测 📈", "ja": "5年間の利益予測 📈"},
    "Net profit margin projected: 15-20% by year 5": {"de": "Prognostizierte Nettogewinnmarge: 15-20% im 5. Jahr", "es": "Margen de beneficio neto proyectado: 15-20% para el año 5", "zh": "预计净利润率：第5年为 15-20%", "ja": "予想純利益率：5年目までに 15-20%"},
    "The Innovators": {"de": "Die Innovatoren", "es": "Los Innovadores", "zh": "创新者", "ja": "イノベーター"},
    "Meet the team behind the revolution.": {"de": "Treffen Sie das Team hinter der Revolution.", "es": "Conozca al equipo detrás de la revolución.", "zh": "认识革命背后的团队。", "ja": "革命の背後にいるチームに会いましょう。"},
    "View Full Team": {"de": "Vollständiges Team anzeigen", "es": "Ver Equipo Completo", "zh": "查看完整团队", "ja": "フルチームを見る"},
    "01.": {"de": "01.", "es": "01.", "zh": "01.", "ja": "01."},
    "02.": {"de": "02.", "es": "02.", "zh": "02.", "ja": "02."},
    "03.": {"de": "03.", "es": "03.", "zh": "03.", "ja": "03."},
    "04.": {"de": "04.", "es": "04.", "zh": "04.", "ja": "04."},
    "05.": {"de": "05.", "es": "05.", "zh": "05.", "ja": "05."},
}

# Add accent colors and fonts
cultural_styles = {
    'bn': {
        'accent': '#006a4e',
        'font_head': '<link href="https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap" rel="stylesheet">',
        'css': ":root { --accent-color: #006a4e; --font-main: 'Tiro Bangla', serif; } body, h1, h2, h3, h4, .font-display, .font-sans { font-family: var(--font-main) !important; }"
    },
    'de': {
        'accent': '#DD0000',
        'font_head': '',
        'css': ":root { --accent-color: #DD0000; }"
    },
    'es': {
        'accent': '#FFC400',
        'font_head': '',
        'css': ":root { --accent-color: #FFC400; }"
    },
    'zh': {
        'accent': '#FF0000',
        'font_head': '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet">',
        'css': ":root { --accent-color: #FF0000; --font-main: 'Noto Sans SC', system-ui; } body, h1, h2, h3, h4, .font-display, .font-sans { font-family: var(--font-main) !important; }"
    },
    'ja': {
        'accent': '#BC002D',
        'font_head': '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet">',
        'css': ":root { --accent-color: #BC002D; --font-main: 'Noto Sans JP', system-ui; } body, h1, h2, h3, h4, .font-display, .font-sans { font-family: var(--font-main) !important; }"
    },
    'en': {
        'accent': '#10b981', # Default Emerald
        'font_head': '',
        'css': ''
    }
}

def translate_content(text, lang):
    if lang == 'en' or not text: return text
    stripped = text.strip()
    
    # Exact Match
    if stripped in t_db:
        if lang in t_db[stripped]:
            return text.replace(stripped, t_db[stripped][lang])
            
    # Substring Match (Greedy)
    # Sort keys by length descending to match longest phrases first
    sorted_keys = sorted(t_db.keys(), key=len, reverse=True)
    for k in sorted_keys:
        if k in text:
            if lang in t_db[k]:
                text = text.replace(k, t_db[k][lang])
                
    return text

def process_file(src_path, dest_path, lang, page_name):
    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Links (Relative Directory Structure)
    # Target: ../{page_folder}/index.html
    # Links might be "index.html", "founder.html", etc.
    for old, folder in pages_map.items():
        pattern = f'href="{old}.html"'
        replacement = f'href="../{folder}/index.html"'
        content = content.replace(pattern, replacement)
        
        pattern = f'href="{old}.html#'
        replacement = f'href="../{folder}/index.html#'
        content = content.replace(pattern, replacement)
        
        pattern = f'href="{old}.html?'
        replacement = f'href="../{folder}/index.html?'
        content = content.replace(pattern, replacement)

    # 2. Fix Assets
    content = content.replace('src="src/', 'src="../../src/')
    content = content.replace("src='src/", "src='../../src/")
    content = content.replace('href="src/', 'href="../../src/')
    content = content.replace('url(\'src/', 'url(\'../../src/')
    
    # 3. Translate Content (Text Nodes)
    if lang not in ['en', 'bn']:
        # We need to parse HTML loosely.
        # Strategy: Split by tags, translate text content.
        # This is rudimentary but works for static pages without a parser lib in restricted env.
        
        # Split by tags
        parts = re.split(r'(<[^>]+>)', content)
        new_parts = []
        for part in parts:
            if part.startswith('<'):
                # Check for attributes to translate like placeholder, title
                # e.g. placeholder="Plan a trip..."
                if 'placeholder="' in part:
                    p_match = re.search(r'placeholder="([^"]+)"', part)
                    if p_match:
                        orig_ph = p_match.group(1)
                        trans_ph = translate_content(orig_ph, lang)
                        part = part.replace(f'placeholder="{orig_ph}"', f'placeholder="{trans_ph}"')
                new_parts.append(part)
            else:
                # Text node
                # Skip script content? No easy way to detect context here strictly.
                # However, our translation dict keys are specific enough not to break JS variable names usually.
                # We should be careful about script tags. 
                # Let's assume we rely on the dictionary keys being english phrases.
                trans_text = translate_content(part, lang)
                new_parts.append(trans_text)
        content = "".join(new_parts)

    # 4. Inject Fonts & CSS
    style_data = cultural_styles.get(lang)
    if style_data:
        if style_data['font_head'] and style_data['font_head'] not in content:
            content = content.replace('</head>', f"{style_data['font_head']}\n</head>")
        if style_data['css']:
            content = content.replace('</head>', f"<style>{style_data['css']}</style>\n</head>")
            
    # 5. Inject Language Dropdown
    # Generate Dropdown HTML
    lang_labels = {'en': 'EN', 'bn': 'BN', 'de': 'DE', 'es': 'ES', 'zh': 'ZH', 'ja': 'JA'}
    
    dropdown = f"""
    <div class="relative group z-[10002] inline-block">
        <button class="interactive text-slate-300 hover:text-emerald-400 font-medium text-sm uppercase tracking-wide transition-colors flex items-center gap-1 px-3 py-2">
            <i class="fas fa-globe"></i> <span>{lang_labels[lang]}</span> <i class="fas fa-chevron-down text-xs"></i>
        </button>
        <div class="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 z-[10002]">
    """
    for code in langs:
        target_folder = pages_map.get(page_name, 'home')
        link = f"../../{code}/{target_folder}/index.html"
        active = 'text-emerald-400' if code == lang else 'text-slate-300'
        dropdown += f'<a href="{link}" class="block px-4 py-2 text-sm {active} hover:text-emerald-400 hover:bg-slate-800">{lang_labels[code]}</a>\n'
    dropdown += "</div></div>"
    
    # Locate and Replace Navbar Toggle
    # Pattern to find: The nav container. 
    # We look for the last <a> in the desktop nav or an existing dropdown structure from previous run.
    
    # Heuristic: Find <div class="hidden md:flex items-center space-x-8"...> ... </div>
    # Inside, replace the language part.
    
    nav_pattern = re.compile(r'(<div class="hidden md:flex items-center space-x-8".*?>)(.*?)(</div>)', re.DOTALL)
    match = nav_pattern.search(content)
    if match:
        nav_start = match.group(1)
        nav_inner = match.group(2)
        nav_end = match.group(3)
        
        # Remove old toggles/dropdowns
        # Remove simple links: <a ...>ENGLISH</a> or <a ...>BN</a>
        nav_inner = re.sub(r'<a href="[^"]*?"[^>]*?>\s*(ENGLISH|English|বাংলা|Deutsch|Español|中文|日本語|BN|DE|ES|ZH|JA)\s*.*?</a>', '', nav_inner, flags=re.DOTALL)
        # Remove dropdown div
        nav_inner = re.sub(r'<div class="relative group z-\[10002\] inline-block">.*?</div>\s*</div>', '', nav_inner, flags=re.DOTALL)
        
        # Append new dropdown
        content = content.replace(match.group(0), nav_start + nav_inner + dropdown + nav_end)

    # 6. Mobile Menu Language List
    mobile_menu_pattern = re.compile(r'(<div id="mobile-menu".*?><div class="px-4 py-4 space-y-3 flex flex-col">)(.*?)(</div>\s*</div>)', re.DOTALL)
    mm_match = mobile_menu_pattern.search(content)
    if mm_match:
        mm_start = mm_match.group(1)
        mm_inner = mm_match.group(2)
        mm_end = mm_match.group(3)
        
        # Clean old toggles
        mm_inner = re.sub(r'<a href="[^"]*?"[^>]*?>\s*(ENGLISH|English|বাংলা|Switch to.*?|Language:.*?)\s*</a>', '', mm_inner, flags=re.DOTALL)
        
        # Add links
        mm_links = ""
        for code in langs:
            target_folder = pages_map.get(page_name, 'home')
            link = f"../../{code}/{target_folder}/index.html"
            mm_links += f'<a href="{link}" class="block text-slate-300 hover:text-emerald-400 hover:bg-slate-800 px-4 py-3 rounded-lg transition-colors font-medium text-sm border-t border-slate-800">Language: {lang_labels[code]}</a>\n'
            
        content = content.replace(mm_match.group(0), mm_start + mm_inner + mm_links + mm_end)

    # 7. Fix Back to Top (Icon Only)
    # Find <div id="back-to-top"...><button...>CONTENT</button></div>
    btt_pattern = re.compile(r'(<div id="back-to-top".*?<button.*?>)(.*?)(</button>)', re.DOTALL)
    btt_match = btt_pattern.search(content)
    if btt_match:
        icon = '<i data-lucide="arrow-up" class="w-6 h-6 group-hover:-translate-y-1 transition-transform"></i>'
        content = content.replace(btt_match.group(0), btt_match.group(1) + icon + btt_match.group(3))

    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Built {dest_path}")

# --- Execution ---

# Clean old generated files if needed (optional, we overwrite)
# Iterate
for lang in langs:
    for old_name, folder in pages_map.items():
        # Source logic: BN uses _bn.html, others use .html (and we translate)
        src = f"{old_name}_bn.html" if lang == 'bn' else f"{old_name}.html"
        if not os.path.exists(src):
            # Fallback for subpages that might not have _bn?
            # Based on previous turns, we created them.
            print(f"Missing source {src}")
            continue
            
        dest_dir = f"{lang}/{folder}"
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
            
        dest_file = f"{dest_dir}/index.html"
        process_file(src, dest_file, lang, old_name)

# Root Index Redirect
with open('index.html', 'w') as f:
    f.write('<meta http-equiv="refresh" content="0; url=en/home/index.html">')

print("Build Complete.")
