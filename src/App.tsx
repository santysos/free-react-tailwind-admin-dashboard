import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";

import PatientsList from "./pages/Patients/PatientsList";
import PatientDetail from "./pages/Patients/PatientDetail";
import PatientCreate from "./pages/Patients/PatientCreate";
import PatientEdit from "./pages/Patients/PatientEdit";

import ConsultationCreate from "./pages/Consultations/ConsultationCreate";
import SessionCreate from "./pages/Sessions/SessionCreate";
import ConsultationEdit from "./pages/Consultations/ConsultationEdit";
import SessionEdit from "./pages/Sessions/SessionEdit";
import TherapistsList from "./pages/Therapists/TherapistsList";
import TherapistCreate from "./pages/Therapists/TherapistCreate";
import TherapistEdit from "./pages/Therapists/TherapistEdit";



export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Dashboard Layout */}
        <Route element={<AppLayout />}>
          <Route index path="/" element={<Home />} />

          {/* Others Page */}
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />

          {/* Forms */}
          <Route path="/form-elements" element={<FormElements />} />

          {/* Tables */}
          <Route path="/basic-tables" element={<BasicTables />} />

          {/* Ui Elements */}
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />

          {/* Patients */}
          <Route path="/patients" element={<PatientsList />} />
          <Route path="/patients/new" element={<PatientCreate />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/patients/:id/edit" element={<PatientEdit />} />

          {/* Consultations */}
          <Route path="/consultations/new" element={<ConsultationCreate />} />
          {/* Alias opcional */}
          <Route path="/consultations/create" element={<ConsultationCreate />} />
          <Route path="/consultations/:id/edit" element={<ConsultationEdit />} />

                    {/* Therapists */}
          <Route path="/therapists" element={<TherapistsList />} />
          <Route path="/therapists/new" element={<TherapistCreate />} />
          <Route path="/therapists/:id/edit" element={<TherapistEdit />} />



          {/* Sessions */}
          <Route path="/sessions/new" element={<SessionCreate />} />
          {/* Alias opcional */}
          <Route path="/sessions/create" element={<SessionCreate />} />
          <Route path="/sessions/:id/edit" element={<SessionEdit />} />


          {/* Charts */}
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
        </Route>

        {/* Auth Layout */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
