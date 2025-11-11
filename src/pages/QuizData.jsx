import React from "react";

const quizData = {
  "Web Development": {
    Beginner: [
      {
        question: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "Home Tool Markup Language",
          "Hyperlinks and Text Markup Language",
          "Hyperlinking Text Marking Language",
        ],
        answer: "Hyper Text Markup Language",
      },
      {
        question: "Which tag is used for a line break in HTML?",
        options: ["<br>", "<lb>", "<break>", "<line>"],
        answer: "<br>",
      },
      {
        question: "What does CSS stand for?",
        options: [
          "Cascading Style Sheets",
          "Computer Style Sheets",
          "Creative Style Sheets",
          "Colorful Style Sheets",
        ],
        answer: "Cascading Style Sheets",
      },
      {
        question: "Which property is used to change the background color in CSS?",
        options: ["color", "background-color", "bgcolor", "background"],
        answer: "background-color",
      },
      {
        question: "Inside which HTML element do we put the JavaScript?",
        options: ["<script>", "<js>", "<javascript>", "<code>"],
        answer: "<script>",
      },
      {
        question: "How do you write 'Hello World' in an alert box?",
        options: [
          "alertBox('Hello World');",
          "msg('Hello World');",
          "alert('Hello World');",
          "msgBox('Hello World');",
        ],
        answer: "alert('Hello World');",
      },
      {
        question: "Which symbol is used for comments in JavaScript?",
        options: ["//", "/*", "#", "<!-- -->"],
        answer: "//",
      },
      {
        question: "What is the correct HTML element for inserting a line break?",
        options: ["<break>", "<br>", "<lb>", "<ln>"],
        answer: "<br>",
      },
      {
        question: "Which HTML attribute is used to define inline styles?",
        options: ["class", "font", "style", "styles"],
        answer: "style",
      },
      {
        question: "Which HTML element is used to specify a footer for a document?",
        options: ["<footer>", "<bottom>", "<section>", "<aside>"],
        answer: "<footer>",
      },
    ],
    Intermediate: [
      {
        question: "What does the 'this' keyword refer to in JavaScript?",
        options: [
          "The current object",
          "The previous object",
          "A global variable",
          "An undefined value",
        ],
        answer: "The current object",
      },
      {
        question: "Which HTTP method is typically used to update data on a server?",
        options: ["GET", "POST", "PUT", "DELETE"],
        answer: "PUT",
      },
      {
        question: "What is the purpose of the 'useEffect' hook in React?",
        options: [
          "To handle side effects",
          "To create state",
          "To render UI",
          "To fetch HTML elements",
        ],
        answer: "To handle side effects",
      },
      {
        question: "Which CSS property controls the layout of flex items?",
        options: ["display", "flex-direction", "position", "float"],
        answer: "flex-direction",
      },
      {
        question: "What is a promise in JavaScript?",
        options: [
          "An object representing eventual completion or failure of async operation",
          "A type of variable",
          "A CSS animation",
          "A React component",
        ],
        answer: "An object representing eventual completion or failure of async operation",
      },
      {
        question: "Which attribute in HTML5 is used to embed video?",
        options: ["<video>", "<media>", "<movie>", "<embed>"],
        answer: "<video>",
      },
      {
        question: "What is event delegation in JavaScript?",
        options: [
          "Handling events at a higher level instead of individual elements",
          "Delegating tasks to other programmers",
          "Running multiple events simultaneously",
          "Blocking events from bubbling",
        ],
        answer: "Handling events at a higher level instead of individual elements",
      },
      {
        question: "Which React lifecycle method runs after the component output has been rendered to the DOM?",
        options: [
          "componentDidMount",
          "componentWillMount",
          "render",
          "shouldComponentUpdate",
        ],
        answer: "componentDidMount",
      },
      {
        question: "Which CSS unit is relative to the font size of the root element?",
        options: ["em", "px", "rem", "%"],
        answer: "rem",
      },
      {
        question: "What does JSON stand for?",
        options: [
          "JavaScript Object Notation",
          "Java Source Open Network",
          "JavaScript Output Number",
          "Java Simple Object Notation",
        ],
        answer: "JavaScript Object Notation",
      },
    ],
    Advanced: [
      {
        question: "What is the difference between '==' and '===' in JavaScript?",
        options: [
          "'==' compares values, '===' compares values and types",
          "'==' compares types, '===' compares values",
          "They are the same",
          "Neither is used in JavaScript",
        ],
        answer: "'==' compares values, '===' compares values and types",
      },
      {
        question: "What is the Virtual DOM in React?",
        options: [
          "A lightweight copy of the real DOM",
          "The actual browser DOM",
          "A database",
          "A CSS framework",
        ],
        answer: "A lightweight copy of the real DOM",
      },
      {
        question: "What is closure in JavaScript?",
        options: [
          "A function having access to its outer scope even after the outer function has closed",
          "An object property",
          "A type of variable",
          "An error type",
        ],
        answer: "A function having access to its outer scope even after the outer function has closed",
      },
      {
        question: "What are Higher Order Components (HOC) in React?",
        options: [
          "Functions that take components and return new components",
          "Components with higher priority",
          "Components rendered on server",
          "Components written in a higher language",
        ],
        answer: "Functions that take components and return new components",
      },
      {
        question: "What is event bubbling in the DOM?",
        options: [
          "An event propagates from the target element up through ancestors",
          "An event propagates from ancestors down to the target",
          "An error in event handling",
          "A CSS animation effect",
        ],
        answer: "An event propagates from the target element up through ancestors",
      },
      {
        question: "Which HTTP status code means 'Not Found'?",
        options: ["404", "200", "500", "301"],
        answer: "404",
      },
      {
        question: "What does the 'async' keyword do in JavaScript?",
        options: [
          "Defines a function that returns a Promise",
          "Defines a synchronous function",
          "Blocks code execution",
          "Declares a variable",
        ],
        answer: "Defines a function that returns a Promise",
      },
      {
        question: "What is the purpose of the React 'key' prop?",
        options: [
          "To help React identify which items have changed",
          "To assign unique IDs to components",
          "To style components",
          "To manage state",
        ],
        answer: "To help React identify which items have changed",
      },
      {
        question: "What is a service worker in Progressive Web Apps (PWA)?",
        options: [
          "A script that runs in the background and enables offline capabilities",
          "A React component",
          "A server-side tool",
          "A CSS module",
        ],
        answer: "A script that runs in the background and enables offline capabilities",
      },
      {
        question: "Which method converts a JavaScript object to a JSON string?",
        options: ["JSON.stringify()", "JSON.parse()", "toJSON()", "toString()"],
        answer: "JSON.stringify()",
      },
    ],
  },

  "Data Science": {
    Beginner: [
      {
        question: "What is supervised learning?",
        options: [
          "Learning with labeled data",
          "Learning with unlabeled data",
          "Learning without data",
          "Learning with random data",
        ],
        answer: "Learning with labeled data",
      },
      {
        question: "Which algorithm is used for clustering?",
        options: ["K-Means", "Linear Regression", "Decision Tree", "Naive Bayes"],
        answer: "K-Means",
      },
      {
        question: "What does PCA stand for?",
        options: [
          "Principal Component Analysis",
          "Primary Component Algorithm",
          "Principal Clustering Analysis",
          "Primary Classification Algorithm",
        ],
        answer: "Principal Component Analysis",
      },
      {
        question: "What is the purpose of train/test split?",
        options: [
          "To evaluate model performance",
          "To clean the data",
          "To visualize the data",
          "To increase dataset size",
        ],
        answer: "To evaluate model performance",
      },
      {
        question: "What is a confusion matrix used for?",
        options: [
          "To evaluate classification models",
          "To display data distribution",
          "To measure clustering accuracy",
          "To normalize data",
        ],
        answer: "To evaluate classification models",
      },
      {
        question: "Which library is commonly used for machine learning in Python?",
        options: ["scikit-learn", "React", "TensorFlow.js", "Angular"],
        answer: "scikit-learn",
      },
      {
        question: "What is the curse of dimensionality?",
        options: [
          "Problems caused by too many features",
          "A type of data cleaning",
          "An algorithm for clustering",
          "A data visualization technique",
        ],
        answer: "Problems caused by too many features",
      },
      {
        question: "What is a confusion matrix?",
        options: [
          "A table to evaluate classification",
          "A graph to plot data",
          "A clustering technique",
          "A data preprocessing step",
        ],
        answer: "A table to evaluate classification",
      },
      {
        question: "Which metric is suitable for imbalanced classification?",
        options: ["F1 Score", "Accuracy", "MSE", "MAE"],
        answer: "F1 Score",
      },
      {
        question: "Which Python library is used for data visualization?",
        options: ["Matplotlib", "NumPy", "Pandas", "scikit-learn"],
        answer: "Matplotlib",
      },
    ],
    Intermediate: [
      {
        question: "What is overfitting in machine learning?",
        options: [
          "Model performs well on training but poorly on new data",
          "Model performs poorly on training data",
          "Model performs well on all data",
          "Model is too simple",
        ],
        answer: "Model performs well on training but poorly on new data",
      },
      {
        question: "Which algorithm is used for classification?",
        options: ["Decision Tree", "K-Means", "PCA", "Linear Regression"],
        answer: "Decision Tree",
      },
      {
        question: "What is cross-validation used for?",
        options: [
          "To evaluate model generalization",
          "To clean data",
          "To visualize data",
          "To increase dataset size",
        ],
        answer: "To evaluate model generalization",
      },
      {
        question: "What does a ROC curve represent?",
        options: [
          "Trade-off between true positive rate and false positive rate",
          "Data distribution",
          "Clustering accuracy",
          "Model loss",
        ],
        answer: "Trade-off between true positive rate and false positive rate",
      },
      {
        question: "Which Python library is used for deep learning?",
        options: ["TensorFlow", "Pandas", "Matplotlib", "Seaborn"],
        answer: "TensorFlow",
      },
      {
        question: "What is feature engineering?",
        options: [
          "Creating new input features from existing data",
          "Removing features",
          "Normalizing data",
          "Training models",
        ],
        answer: "Creating new input features from existing data",
      },
      {
        question: "What is a confusion matrix's precision?",
        options: [
          "True Positives / (True Positives + False Positives)",
          "True Positives / (True Positives + False Negatives)",
          "True Negatives / (True Negatives + False Positives)",
          "True Negatives / (True Negatives + False Negatives)",
        ],
        answer: "True Positives / (True Positives + False Positives)",
      },
      {
        question: "What is dimensionality reduction?",
        options: [
          "Reducing the number of features",
          "Increasing dataset size",
          "Data normalization",
          "Clustering",
        ],
        answer: "Reducing the number of features",
      },
      {
        question: "What does LSTM stand for in deep learning?",
        options: [
          "Long Short-Term Memory",
          "Large Scale Training Model",
          "Low Sample Time Model",
          "Linear Sequence Training Model",
        ],
        answer: "Long Short-Term Memory",
      },
      {
        question: "What is the purpose of the 'dropout' technique?",
        options: [
          "Prevent overfitting",
          "Increase training speed",
          "Data augmentation",
          "Improve accuracy",
        ],
        answer: "Prevent overfitting",
      },
    ],
    Advanced: [
      {
        question: "What is gradient descent?",
        options: [
          "An optimization algorithm to minimize loss function",
          "A data preprocessing step",
          "A type of neural network",
          "A clustering method",
        ],
        answer: "An optimization algorithm to minimize loss function",
      },
      {
        question: "What is the vanishing gradient problem?",
        options: [
          "Gradients become too small to update weights effectively",
          "Gradient becomes too large",
          "Gradient does not exist",
          "Loss function increases",
        ],
        answer: "Gradients become too small to update weights effectively",
      },
      {
        question: "Which technique is used to handle imbalanced datasets?",
        options: [
          "SMOTE",
          "PCA",
          "Linear Regression",
          "Dropout",
        ],
        answer: "SMOTE",
      },
      {
        question: "What is a GAN?",
        options: [
          "Generative Adversarial Network",
          "General Artificial Network",
          "Graph Analysis Network",
          "Gradient Acceleration Network",
        ],
        answer: "Generative Adversarial Network",
      },
      {
        question: "What is batch normalization?",
        options: [
          "Technique to normalize layer inputs in neural networks",
          "Data cleaning technique",
          "Feature scaling method",
          "Loss function",
        ],
        answer: "Technique to normalize layer inputs in neural networks",
      },
      {
        question: "What is the purpose of the learning rate in training?",
        options: [
          "Controls the step size at each iteration",
          "Defines the model architecture",
          "Determines batch size",
          "Specifies number of layers",
        ],
        answer: "Controls the step size at each iteration",
      },
      {
        question: "What does the term 'early stopping' mean?",
        options: [
          "Halting training to prevent overfitting",
          "Starting training early",
          "Reducing learning rate",
          "Increasing batch size",
        ],
        answer: "Halting training to prevent overfitting",
      },
      {
        question: "What is reinforcement learning?",
        options: [
          "Learning by interacting with environment and receiving rewards",
          "Learning from labeled data",
          "Learning from unlabeled data",
          "Unsupervised clustering",
        ],
        answer: "Learning by interacting with environment and receiving rewards",
      },
      {
        question: "Which algorithm is used for dimensionality reduction?",
        options: [
          "t-SNE",
          "Random Forest",
          "KNN",
          "SVM",
        ],
        answer: "t-SNE",
      },
      {
        question: "What is the difference between bagging and boosting?",
        options: [
          "Bagging trains models independently; boosting sequentially",
          "Boosting trains models independently; bagging sequentially",
          "They are the same",
          "Neither is an ensemble method",
        ],
        answer: "Bagging trains models independently; boosting sequentially",
      },
    ],
  },

  "UI/UX Design": {
    Beginner: [
      {
        question: "What does UX stand for?",
        options: ["User Experience", "User Exchange", "Universal Experience", "User Example"],
        answer: "User Experience",
      },
      {
        question: "Which tool is commonly used for UI design?",
        options: ["Figma", "React", "VS Code", "Jira"],
        answer: "Figma",
      },
      {
        question: "What is wireframing?",
        options: [
          "A blueprint for UI layout",
          "A coding technique",
          "A testing method",
          "A marketing strategy",
        ],
        answer: "A blueprint for UI layout",
      },
      {
        question: "What is the main goal of UI design?",
        options: [
          "Make interfaces user-friendly",
          "Write backend code",
          "Test software bugs",
          "Optimize server performance",
        ],
        answer: "Make interfaces user-friendly",
      },
      {
        question: "Which principle ensures users can find information easily?",
        options: ["Navigation", "Coding", "Debugging", "Database"],
        answer: "Navigation",
      },
      {
        question: "What is prototyping?",
        options: [
          "An early sample or model",
          "Writing code",
          "Deploying an app",
          "Fixing bugs",
        ],
        answer: "An early sample or model",
      },
      {
        question: "What is a primary color?",
        options: ["Red", "Green", "Orange", "Pink"],
        answer: "Red",
      },
      {
        question: "What is a basic design principle?",
        options: ["Balance", "Speed", "Size", "Database"],
        answer: "Balance",
      },
      {
        question: "What does responsive design mean?",
        options: [
          "Adapts to different screen sizes",
          "Uses fast servers",
          "Is SEO friendly",
          "Is secure",
        ],
        answer: "Adapts to different screen sizes",
      },
      {
        question: "What is accessibility in UI design?",
        options: [
          "Making apps usable for everyone",
          "Designing only for desktop",
          "Ignoring color contrast",
          "Adding ads",
        ],
        answer: "Making apps usable for everyone",
      },
    ],
    Intermediate: [
      {
        question: "What does the Gestalt principle explain?",
        options: [
          "How humans perceive visual elements as groups",
          "Coding best practices",
          "SEO techniques",
          "Performance optimization",
        ],
        answer: "How humans perceive visual elements as groups",
      },
      {
        question: "What is usability testing?",
        options: [
          "Testing how easy an app is to use",
          "Performance testing",
          "Security testing",
          "Unit testing",
        ],
        answer: "Testing how easy an app is to use",
      },
      {
        question: "What is the purpose of user personas?",
        options: [
          "Represent typical users",
          "Design database schemas",
          "Write marketing content",
          "Debug code",
        ],
        answer: "Represent typical users",
      },
      {
        question: "Which layout principle aligns elements along a vertical or horizontal line?",
        options: ["Alignment", "Contrast", "Repetition", "Proximity"],
        answer: "Alignment",
      },
      {
        question: "What is the difference between UI and UX?",
        options: [
          "UI is visual design; UX is overall experience",
          "UI is coding; UX is testing",
          "UI is marketing; UX is sales",
          "UI is hardware; UX is software",
        ],
        answer: "UI is visual design; UX is overall experience",
      },
      {
        question: "What is the purpose of a style guide?",
        options: [
          "Ensure design consistency",
          "Write backend code",
          "Manage database",
          "Test APIs",
        ],
        answer: "Ensure design consistency",
      },
      {
        question: "What is A/B testing?",
        options: [
          "Comparing two versions to find the better one",
          "Testing on two devices",
          "Writing two codes",
          "Deploying twice",
        ],
        answer: "Comparing two versions to find the better one",
      },
      {
        question: "Which design tool allows for vector graphics editing?",
        options: ["Adobe Illustrator", "Photoshop", "VS Code", "Slack"],
        answer: "Adobe Illustrator",
      },
      {
        question: "What does 'affordance' mean in design?",
        options: [
          "Clues about how an object should be used",
          "Color selection",
          "Font choice",
          "Code structure",
        ],
        answer: "Clues about how an object should be used",
      },
      {
        question: "What is the F-shaped reading pattern?",
        options: [
          "How users scan web pages",
          "A coding pattern",
          "An algorithm",
          "A testing method",
        ],
        answer: "How users scan web pages",
      },
    ],
    Advanced: [
      {
        question: "What is cognitive load in UX design?",
        options: [
          "The mental effort required to use a product",
          "Server load",
          "Network speed",
          "Number of UI elements",
        ],
        answer: "The mental effort required to use a product",
      },
      {
        question: "What is the difference between qualitative and quantitative research?",
        options: [
          "Qualitative is descriptive; quantitative is numerical",
          "Both are the same",
          "Qualitative is numerical; quantitative is descriptive",
          "Neither is used in UX",
        ],
        answer: "Qualitative is descriptive; quantitative is numerical",
      },
      {
        question: "What is a design system?",
        options: [
          "A collection of reusable components and guidelines",
          "A type of coding framework",
          "A testing tool",
          "A marketing plan",
        ],
        answer: "A collection of reusable components and guidelines",
      },
      {
        question: "What does heuristic evaluation involve?",
        options: [
          "Experts review a UI against usability principles",
          "User interviews",
          "Performance testing",
          "SEO optimization",
        ],
        answer: "Experts review a UI against usability principles",
      },
      {
        question: "Which method is used for rapid prototyping?",
        options: [
          "Sketching and wireframing",
          "Writing production code",
          "Deploying to production",
          "Testing backend APIs",
        ],
        answer: "Sketching and wireframing",
      },
      {
        question: "What is the purpose of microinteractions?",
        options: [
          "Enhance user experience with small feedback",
          "Debug code",
          "Optimize server",
          "Analyze traffic",
        ],
        answer: "Enhance user experience with small feedback",
      },
      {
        question: "What is the main focus of human-centered design?",
        options: [
          "Designing for users' needs and behaviors",
          "Writing code",
          "Managing servers",
          "Marketing products",
        ],
        answer: "Designing for users' needs and behaviors",
      },
      {
        question: "What is a service blueprint?",
        options: [
          "Visual map of service process, touchpoints, and actors",
          "Coding framework",
          "Testing plan",
          "Marketing strategy",
        ],
        answer: "Visual map of service process, touchpoints, and actors",
      },
      {
        question: "What is responsive typography?",
        options: [
          "Typography that adjusts to screen size",
          "Fixed font size",
          "Only used in print",
          "Not related to UI design",
        ],
        answer: "Typography that adjusts to screen size",
      },
      {
        question: "What is the purpose of eye-tracking studies?",
        options: [
          "Analyze where users look on a screen",
          "Measure loading speed",
          "Test code functionality",
          "Optimize SEO",
        ],
        answer: "Analyze where users look on a screen",
      },
    ],
  },

  "Digital Marketing": {
    Beginner: [
      {
        question: "What does SEO stand for?",
        options: [
          "Search Engine Optimization",
          "Social Engagement Opportunity",
          "Search Email Outreach",
          "Social Engine Operation",
        ],
        answer: "Search Engine Optimization",
      },
      {
        question: "What is a keyword in digital marketing?",
        options: [
          "A word used to find content",
          "A programming term",
          "An email subject line",
          "A social media post",
        ],
        answer: "A word used to find content",
      },
      {
        question: "What is PPC advertising?",
        options: [
          "Pay Per Click",
          "Pay Per Customer",
          "Private Paid Content",
          "Public Paid Campaign",
        ],
        answer: "Pay Per Click",
      },
      {
        question: "Which platform is primarily used for professional networking?",
        options: ["LinkedIn", "Instagram", "Facebook", "Snapchat"],
        answer: "LinkedIn",
      },
      {
        question: "What does CTR stand for?",
        options: [
          "Click Through Rate",
          "Content To Reach",
          "Cost To Revenue",
          "Customer Target Rate",
        ],
        answer: "Click Through Rate",
      },
      {
        question: "What is content marketing?",
        options: [
          "Creating valuable content to attract audience",
          "Paying for ads",
          "Sending emails",
          "Making sales calls",
        ],
        answer: "Creating valuable content to attract audience",
      },
      {
        question: "What is a landing page?",
        options: [
          "A webpage for a marketing campaign",
          "A homepage",
          "An email template",
          "A social media profile",
        ],
        answer: "A webpage for a marketing campaign",
      },
      {
        question: "What is bounce rate?",
        options: [
          "Percentage of visitors who leave quickly",
          "Number of sales",
          "Clicks on ads",
          "Emails opened",
        ],
        answer: "Percentage of visitors who leave quickly",
      },
      {
        question: "What is the primary purpose of email marketing?",
        options: [
          "Engage and nurture customers",
          "Design websites",
          "Analyze data",
          "Write code",
        ],
        answer: "Engage and nurture customers",
      },
      {
        question: "What is influencer marketing?",
        options: [
          "Using popular people to promote products",
          "Email marketing",
          "PPC advertising",
          "Search engine optimization",
        ],
        answer: "Using popular people to promote products",
      },
    ],
    Intermediate: [
      {
        question: "What is the primary benefit of remarketing?",
        options: [
          "Reach users who previously interacted with your site",
          "Create new customers",
          "Increase website speed",
          "Improve email deliverability",
        ],
        answer: "Reach users who previously interacted with your site",
      },
      {
        question: "What is Google Analytics used for?",
        options: [
          "Track and analyze website traffic",
          "Manage social media",
          "Send emails",
          "Create ads",
        ],
        answer: "Track and analyze website traffic",
      },
      {
        question: "What is the difference between SEO and SEM?",
        options: [
          "SEO is organic; SEM includes paid ads",
          "SEO is paid; SEM is free",
          "Both are the same",
          "Neither involves marketing",
        ],
        answer: "SEO is organic; SEM includes paid ads",
      },
      {
        question: "What is the purpose of a CTA (Call to Action)?",
        options: [
          "Encourage users to take action",
          "Analyze traffic",
          "Create content",
          "Design websites",
        ],
        answer: "Encourage users to take action",
      },
      {
        question: "Which metric measures ad effectiveness?",
        options: ["Conversion Rate", "Bounce Rate", "Page Views", "Impressions"],
        answer: "Conversion Rate",
      },
      {
        question: "What is A/B testing in marketing?",
        options: [
          "Comparing two versions to improve performance",
          "Testing backend code",
          "Sending emails",
          "Creating ads",
        ],
        answer: "Comparing two versions to improve performance",
      },
      {
        question: "What does CPC stand for?",
        options: ["Cost Per Click", "Content Performance Cost", "Customer Purchase Cost", "Click Per Customer"],
        answer: "Cost Per Click",
      },
      {
        question: "What is organic traffic?",
        options: [
          "Visitors from unpaid search results",
          "Paid ads visitors",
          "Email subscribers",
          "Social media followers",
        ],
        answer: "Visitors from unpaid search results",
      },
      {
        question: "What is a buyer persona?",
        options: [
          "A fictional representation of ideal customer",
          "A marketing tool",
          "A sales target",
          "A product feature",
        ],
        answer: "A fictional representation of ideal customer",
      },
      {
        question: "What does the term 'impressions' mean?",
        options: [
          "Number of times an ad is shown",
          "Number of clicks on an ad",
          "Number of purchases",
          "Number of emails sent",
        ],
        answer: "Number of times an ad is shown",
      },
    ],
    Advanced: [
      {
        question: "What is programmatic advertising?",
        options: [
          "Automated buying of ads using software",
          "Manual ad buying",
          "Email marketing automation",
          "Content creation",
        ],
        answer: "Automated buying of ads using software",
      },
      {
        question: "What is the difference between first-party and third-party cookies?",
        options: [
          "First-party are from the website visited; third-party from others",
          "Third-party are secure; first-party are not",
          "Both are the same",
          "Neither is used anymore",
        ],
        answer: "First-party are from the website visited; third-party from others",
      },
      {
        question: "What is attribution modeling?",
        options: [
          "Determining which marketing channels contribute to conversions",
          "Marketing budget allocation",
          "Ad campaign setup",
          "Email scheduling",
        ],
        answer: "Determining which marketing channels contribute to conversions",
      },
      {
        question: "What is the main use of UTM parameters?",
        options: [
          "Track campaign performance in analytics",
          "Improve SEO",
          "Create ads",
          "Send emails",
        ],
        answer: "Track campaign performance in analytics",
      },
      {
        question: "What is a lookalike audience?",
        options: [
          "Audience similar to existing customers",
          "Random group of users",
          "Marketing team",
          "Product features",
        ],
        answer: "Audience similar to existing customers",
      },
      {
        question: "What is churn rate?",
        options: [
          "Percentage of customers who stop using a service",
          "Number of new customers",
          "Revenue growth",
          "Marketing budget",
        ],
        answer: "Percentage of customers who stop using a service",
      },
      {
        question: "Which metric indicates how often users engage with content?",
        options: ["Engagement Rate", "Bounce Rate", "CTR", "Impressions"],
        answer: "Engagement Rate",
      },
      {
        question: "What is the main goal of remarketing campaigns?",
        options: [
          "Convert previous visitors into customers",
          "Generate new leads",
          "Increase website speed",
          "Build brand awareness",
        ],
        answer: "Convert previous visitors into customers",
      },
      {
        question: "What is native advertising?",
        options: [
          "Ads that blend with platform content",
          "Pop-up ads",
          "Email spam",
          "Banner ads",
        ],
        answer: "Ads that blend with platform content",
      },
      {
        question: "What is the purpose of SEO backlinks?",
        options: [
          "Improve site authority and rankings",
          "Increase ad spend",
          "Create email lists",
          "Design websites",
        ],
        answer: "Improve site authority and rankings",
      },
    ],
  },
};

export default quizData;