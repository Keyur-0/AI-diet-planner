import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import Button from './Button';

export default function DietForm({ onSubmit, isLoading, serverError }) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    goal: '',
    activityLevel: '',
    foodPreference: '',
    favoriteFoods: '',
    allergies: '',
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

    // Clear error on change if fixed
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
    if (!formData.name.trim()) newErrors.name = t('form.errors.nameRequired');
    if (!formData.age) {
      newErrors.age = t('form.errors.ageRequired');
    } else if (Number(formData.age) < 12 || Number(formData.age) > 100) {
      newErrors.age = t('form.errors.ageRange');
    }
    if (!formData.gender) newErrors.gender = t('form.errors.genderRequired');

    // 2. Body Metrics
    if (!formData.height) {
      newErrors.height = t('form.errors.heightRequired');
    } else if (Number(formData.height) < 80 || Number(formData.height) > 250) {
      newErrors.height = t('form.errors.heightRange');
    }

    if (!formData.weight) {
      newErrors.weight = t('form.errors.weightRequired');
    } else if (Number(formData.weight) < 25 || Number(formData.weight) > 300) {
      newErrors.weight = t('form.errors.weightRange');
    }

    // 3. Fitness Goals
    if (!formData.goal) newErrors.goal = t('form.errors.goalRequired');
    if (!formData.activityLevel) newErrors.activityLevel = t('form.errors.activityRequired');

    // 4. Food Preferences
    if (!formData.foodPreference) newErrors.foodPreference = t('form.errors.dietRequired');

    // 5. Contact Information
    if (!formData.phone.trim()) {
      newErrors.phone = t('form.errors.phoneRequired');
    } else if (formData.phone.trim().length < 7) {
      newErrors.phone = t('form.errors.phoneValid');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('form.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = t('form.errors.emailValid');
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
          className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm space-y-3"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">⚠️</span>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-base">
                {t('plan.errorTitle')}
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
              ↻ {t('plan.tryAgain')}
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: PERSONAL INFORMATION */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-bold">
            1
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">{t('form.section1Title')}</h3>
            <p className="text-xs text-slate-400">{t('form.section1Desc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <FormInput
              label={t('form.nameLabel')}
              name="name"
              placeholder={t('form.namePlaceholder')}
              value={formData.name}
              onChange={handleChange}
              required
              error={errors.name}
            />
          </div>

          <div>
            <FormInput
              label={t('form.ageLabel')}
              name="age"
              type="number"
              min="12"
              max="100"
              placeholder={t('form.agePlaceholder')}
              unit={t('form.ageUnit')}
              value={formData.age}
              onChange={handleChange}
              required
              error={errors.age}
            />
          </div>

          <div className="sm:col-span-3">
            <FormSelect
              label={t('form.genderLabel')}
              name="gender"
              placeholder={t('form.genderPlaceholder')}
              value={formData.gender}
              onChange={handleChange}
              required
              error={errors.gender}
              options={[
                { value: 'Male', label: t('form.genderOptions.male') },
                { value: 'Female', label: t('form.genderOptions.female') },
                { value: 'Other', label: t('form.genderOptions.other') }
              ]}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: BODY INFORMATION */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-bold">
            2
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">{t('form.section2Title')}</h3>
            <p className="text-xs text-slate-400">{t('form.section2Desc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label={t('form.heightLabel')}
            name="height"
            type="number"
            min="80"
            max="250"
            placeholder={t('form.heightPlaceholder')}
            unit={t('form.heightUnit')}
            helper={t('form.heightHelper')}
            value={formData.height}
            onChange={handleChange}
            required
            error={errors.height}
          />

          <FormInput
            label={t('form.weightLabel')}
            name="weight"
            type="number"
            min="25"
            max="300"
            step="0.5"
            placeholder={t('form.weightPlaceholder')}
            unit={t('form.weightUnit')}
            helper={t('form.weightHelper')}
            value={formData.weight}
            onChange={handleChange}
            required
            error={errors.weight}
          />
        </div>
      </div>

      {/* SECTION 3: FITNESS GOAL */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-bold">
            3
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">{t('form.section3Title')}</h3>
            <p className="text-xs text-slate-400">{t('form.section3Desc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            label={t('form.goalLabel')}
            name="goal"
            placeholder={t('form.goalPlaceholder')}
            value={formData.goal}
            onChange={handleChange}
            required
            error={errors.goal}
            options={[
              { value: 'Weight Loss', label: t('form.goalOptions.weightLoss') },
              { value: 'Muscle Gain', label: t('form.goalOptions.muscleGain') },
              { value: 'Maintain Weight', label: t('form.goalOptions.maintain') }
            ]}
          />

          <FormSelect
            label={t('form.activityLabel')}
            name="activityLevel"
            placeholder={t('form.activityPlaceholder')}
            value={formData.activityLevel}
            onChange={handleChange}
            required
            error={errors.activityLevel}
            options={[
              { value: 'Sedentary', label: t('form.activityOptions.sedentary') },
              { value: 'Lightly Active', label: t('form.activityOptions.light') },
              { value: 'Moderately Active', label: t('form.activityOptions.moderate') },
              { value: 'Very Active', label: t('form.activityOptions.very') }
            ]}
          />
        </div>
      </div>

      {/* SECTION 4: FOOD PREFERENCES */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-bold">
            4
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">{t('form.section4Title')}</h3>
            <p className="text-xs text-slate-400">{t('form.section4Desc')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <FormSelect
            label={t('form.dietLabel')}
            name="foodPreference"
            placeholder={t('form.dietPlaceholder')}
            value={formData.foodPreference}
            onChange={handleChange}
            required
            error={errors.foodPreference}
            options={[
              { value: 'Vegetarian', label: t('form.dietOptions.vegetarian') },
              { value: 'Non-Vegetarian', label: t('form.dietOptions.nonVegetarian') },
              { value: 'Vegan', label: t('form.dietOptions.vegan') }
            ]}
          />

          <div className="space-y-1.5 text-left">
            <label htmlFor="favoriteFoods" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('form.favoriteFoodsLabel')}
            </label>
            <textarea
              id="favoriteFoods"
              name="favoriteFoods"
              rows="2"
              placeholder={t('form.favoriteFoodsPlaceholder')}
              value={formData.favoriteFoods}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-slate-600 transition-all resize-none"
            />
            <p className="text-[11px] text-slate-400">{t('form.favoriteFoodsHelper')}</p>
          </div>

          <FormInput
            label={t('form.allergiesLabel')}
            name="allergies"
            placeholder={t('form.allergiesPlaceholder')}
            helper={t('form.allergiesHelper')}
            value={formData.allergies}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* SECTION 5: CONTACT INFORMATION */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-bold">
            5
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">{t('form.section5Title')}</h3>
            <p className="text-xs text-slate-400">{t('form.section5Desc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label={t('form.phoneLabel')}
            name="phone"
            type="tel"
            placeholder={t('form.phonePlaceholder')}
            value={formData.phone}
            onChange={handleChange}
            required
            error={errors.phone}
          />

          <FormInput
            label={t('form.emailLabel')}
            name="email"
            type="email"
            placeholder={t('form.emailPlaceholder')}
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
          loadingText={t('form.loadingButton')}
          className="w-full text-base font-extrabold uppercase tracking-wider py-4 shadow-xl shadow-emerald-500/20"
        >
          {t('form.submitButton')}
        </Button>
        <p className="text-center text-xs text-slate-400 mt-3">
          {t('form.submitSubtext')}
        </p>
      </div>
    </form>
  );
}
