import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import Button from './Button';

export default function WorkoutForm({ onSubmit, isLoading, serverError }) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    fitnessGoal: '',
    experienceLevel: '',
    workoutLocation: '',
    equipment: '',
    daysPerWeek: '',
    durationMins: '',
    injuries: '',
    preferredExercises: '',
    phone: '',
    email: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // 1. Personal Information
    if (!formData.name.trim()) newErrors.name = t('workoutForm.errors.nameRequired');
    if (!formData.age) {
      newErrors.age = t('workoutForm.errors.ageRequired');
    } else if (Number(formData.age) < 12 || Number(formData.age) > 100) {
      newErrors.age = t('workoutForm.errors.ageRange');
    }
    if (!formData.gender) newErrors.gender = t('workoutForm.errors.genderRequired');

    // 2. Body Metrics
    if (!formData.height) {
      newErrors.height = t('workoutForm.errors.heightRequired');
    } else if (Number(formData.height) < 80 || Number(formData.height) > 250) {
      newErrors.height = t('workoutForm.errors.heightRange');
    }

    if (!formData.weight) {
      newErrors.weight = t('workoutForm.errors.weightRequired');
    } else if (Number(formData.weight) < 25 || Number(formData.weight) > 300) {
      newErrors.weight = t('workoutForm.errors.weightRange');
    }

    // 3. Fitness Goals & Experience
    if (!formData.fitnessGoal) newErrors.fitnessGoal = t('workoutForm.errors.goalRequired');
    if (!formData.experienceLevel) newErrors.experienceLevel = t('workoutForm.errors.experienceRequired');

    // 4. Routine & Environment
    if (!formData.workoutLocation) newErrors.workoutLocation = t('workoutForm.errors.locationRequired');
    if (!formData.daysPerWeek) newErrors.daysPerWeek = t('workoutForm.errors.daysRequired');
    if (!formData.durationMins) newErrors.durationMins = t('workoutForm.errors.durationRequired');

    // 5. Contact Information
    if (!formData.phone.trim()) {
      newErrors.phone = t('workoutForm.errors.phoneRequired');
    } else if (formData.phone.trim().length < 7) {
      newErrors.phone = t('workoutForm.errors.phoneValid');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('workoutForm.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = t('workoutForm.errors.emailValid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Server Error Message Banner */}
      {serverError && (
        <div
          role="alert"
          className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm space-y-3 text-left"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">⚠️</span>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-base">
                {t('workoutForm.errors.serverErrorHeader') || t('plan.errorTitle')}
              </h4>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                {serverError || t('plan.errorDesc')}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1 pl-8">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              ↻ {t('workoutPlan.tryAgain') || t('plan.tryAgain')}
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: PERSONAL INFORMATION */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-5 text-left">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-bold">
            1
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">{t('workoutForm.section1Title')}</h3>
            <p className="text-xs text-slate-400">{t('workoutForm.section1Desc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <FormInput
              label={t('workoutForm.nameLabel')}
              name="name"
              placeholder={t('workoutForm.namePlaceholder')}
              value={formData.name}
              onChange={handleChange}
              required
              error={errors.name}
            />
          </div>

          <div>
            <FormInput
              label={t('workoutForm.ageLabel')}
              name="age"
              type="number"
              min="12"
              max="100"
              placeholder={t('workoutForm.agePlaceholder')}
              unit={t('workoutForm.ageUnit')}
              value={formData.age}
              onChange={handleChange}
              required
              error={errors.age}
            />
          </div>

          <div className="sm:col-span-3">
            <FormSelect
              label={t('workoutForm.genderLabel')}
              name="gender"
              placeholder={t('workoutForm.genderPlaceholder')}
              value={formData.gender}
              onChange={handleChange}
              required
              error={errors.gender}
              options={[
                { value: 'Male', label: t('workoutForm.genderOptions.male') },
                { value: 'Female', label: t('workoutForm.genderOptions.female') },
                { value: 'Other', label: t('workoutForm.genderOptions.other') }
              ]}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: BODY INFORMATION */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-5 text-left">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-bold">
            2
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">{t('workoutForm.section2Title')}</h3>
            <p className="text-xs text-slate-400">{t('workoutForm.section2Desc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label={t('workoutForm.heightLabel')}
            name="height"
            type="number"
            min="80"
            max="250"
            placeholder={t('workoutForm.heightPlaceholder')}
            unit={t('workoutForm.heightUnit')}
            helper={t('workoutForm.heightHelper')}
            value={formData.height}
            onChange={handleChange}
            required
            error={errors.height}
          />

          <FormInput
            label={t('workoutForm.weightLabel')}
            name="weight"
            type="number"
            min="25"
            max="300"
            step="0.5"
            placeholder={t('workoutForm.weightPlaceholder')}
            unit={t('workoutForm.weightUnit')}
            helper={t('workoutForm.weightHelper')}
            value={formData.weight}
            onChange={handleChange}
            required
            error={errors.weight}
          />
        </div>
      </div>

      {/* SECTION 3: FITNESS GOAL & EXPERIENCE */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-5 text-left">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-bold">
            3
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">{t('workoutForm.section3Title')}</h3>
            <p className="text-xs text-slate-400">{t('workoutForm.section3Desc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            label={t('workoutForm.goalLabel')}
            name="fitnessGoal"
            placeholder={t('workoutForm.goalPlaceholder')}
            value={formData.fitnessGoal}
            onChange={handleChange}
            required
            error={errors.fitnessGoal}
            options={[
              { value: 'Weight Loss', label: t('workoutForm.goalOptions.weightLoss') },
              { value: 'Muscle Gain', label: t('workoutForm.goalOptions.muscleGain') },
              { value: 'General Fitness', label: t('workoutForm.goalOptions.generalFitness') },
              { value: 'Strength', label: t('workoutForm.goalOptions.strength') },
              { value: 'Endurance', label: t('workoutForm.goalOptions.endurance') },
            ]}
          />

          <FormSelect
            label={t('workoutForm.experienceLabel')}
            name="experienceLevel"
            placeholder={t('workoutForm.experiencePlaceholder')}
            value={formData.experienceLevel}
            onChange={handleChange}
            required
            error={errors.experienceLevel}
            options={[
              { value: 'Beginner', label: t('workoutForm.experienceOptions.beginner') },
              { value: 'Intermediate', label: t('workoutForm.experienceOptions.intermediate') },
              { value: 'Advanced', label: t('workoutForm.experienceOptions.advanced') }
            ]}
          />
        </div>
      </div>

      {/* SECTION 4: ROUTINE & ENVIRONMENT */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-5 text-left">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-bold">
            4
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">{t('workoutForm.section4Title')}</h3>
            <p className="text-xs text-slate-400">{t('workoutForm.section4Desc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <FormSelect
              label={t('workoutForm.locationLabel')}
              name="workoutLocation"
              placeholder={t('workoutForm.locationPlaceholder')}
              value={formData.workoutLocation}
              onChange={handleChange}
              required
              error={errors.workoutLocation}
              options={[
                { value: 'Gym', label: t('workoutForm.locationOptions.gym') },
                { value: 'Home', label: t('workoutForm.locationOptions.home') },
                { value: 'Outdoor', label: t('workoutForm.locationOptions.outdoor') }
              ]}
            />
          </div>

          <div>
            <FormSelect
              label={t('workoutForm.daysLabel')}
              name="daysPerWeek"
              placeholder={t('workoutForm.daysPlaceholder')}
              value={formData.daysPerWeek}
              onChange={handleChange}
              required
              error={errors.daysPerWeek}
              options={[
                { value: '2', label: t('workoutForm.daysOptions.d2') },
                { value: '3', label: t('workoutForm.daysOptions.d3') },
                { value: '4', label: t('workoutForm.daysOptions.d4') },
                { value: '5', label: t('workoutForm.daysOptions.d5') },
                { value: '6', label: t('workoutForm.daysOptions.d6') },
                { value: '7', label: t('workoutForm.daysOptions.d7') }
              ]}
            />
          </div>

          <div>
            <FormSelect
              label={t('workoutForm.durationLabel')}
              name="durationMins"
              placeholder={t('workoutForm.durationPlaceholder')}
              value={formData.durationMins}
              onChange={handleChange}
              required
              error={errors.durationMins}
              options={[
                { value: '30', label: t('workoutForm.durationOptions.m30') },
                { value: '45', label: t('workoutForm.durationOptions.m45') },
                { value: '60', label: t('workoutForm.durationOptions.m60') },
                { value: '90', label: t('workoutForm.durationOptions.m90') }
              ]}
            />
          </div>

          <div className="sm:col-span-3">
            <FormInput
              label={t('workoutForm.equipmentLabel')}
              name="equipment"
              placeholder={t('workoutForm.equipmentPlaceholder')}
              helper={t('workoutForm.equipmentHelper')}
              value={formData.equipment}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: PHYSICAL SAFETY & PREFERENCES */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-5 text-left">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-bold">
            5
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">{t('workoutForm.section5Title')}</h3>
            <p className="text-xs text-slate-400">{t('workoutForm.section5Desc')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <FormInput
            label={t('workoutForm.injuriesLabel')}
            name="injuries"
            placeholder={t('workoutForm.injuriesPlaceholder')}
            helper={t('workoutForm.injuriesHelper')}
            value={formData.injuries}
            onChange={handleChange}
          />

          <FormInput
            label={t('workoutForm.preferredLabel')}
            name="preferredExercises"
            placeholder={t('workoutForm.preferredPlaceholder')}
            helper={t('workoutForm.preferredHelper')}
            value={formData.preferredExercises}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* SECTION 6: CONTACT INFORMATION */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-5 text-left">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-bold">
            6
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">{t('workoutForm.section6Title')}</h3>
            <p className="text-xs text-slate-400">{t('workoutForm.section6Desc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label={t('workoutForm.phoneLabel')}
            name="phone"
            type="tel"
            placeholder={t('workoutForm.phonePlaceholder')}
            value={formData.phone}
            onChange={handleChange}
            required
            error={errors.phone}
          />

          <FormInput
            label={t('workoutForm.emailLabel')}
            name="email"
            type="email"
            placeholder={t('workoutForm.emailPlaceholder')}
            value={formData.email}
            onChange={handleChange}
            required
            error={errors.email}
          />
        </div>
      </div>

      {/* Submit Button Area */}
      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          loadingText={t('workoutForm.loadingButton')}
          className="w-full text-base font-extrabold uppercase tracking-wider py-4 shadow-xl shadow-emerald-500/20"
        >
          {t('workoutForm.submitButton')}
        </Button>
        <p className="text-center text-xs text-slate-400 mt-3">
          {t('workoutForm.submitSubtext')}
        </p>
      </div>
    </form>
  );
}
