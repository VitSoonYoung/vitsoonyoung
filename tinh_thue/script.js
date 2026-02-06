document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const periodToggle = document.getElementById('periodToggle');
    const grossIncomeInput = document.getElementById('grossIncome');
    const dependentsInput = document.getElementById('dependents');
    const btnDecrement = document.querySelector('.btn-decrement');
    const btnIncrement = document.querySelector('.btn-increment');
    const netIncomeEl = document.getElementById('netIncome');
    const personalDeductionEl = document.getElementById('personalDeduction');
    const dependentDeductionEl = document.getElementById('dependentDeduction');
    const taxableIncomeEl = document.getElementById('taxableIncome');

    // Language Elements
    const langOpts = document.querySelectorAll('.lang-opt');
    const components = document.querySelectorAll('[data-i18n]');

    // Constants
    const DEDUCTION_PERSONAL_MONTH = 15500000;
    const DEDUCTION_DEPENDENT_MONTH = 6200000;

    const DEDUCTION_PERSONAL_YEAR = 186000000;
    const DEDUCTION_DEPENDENT_YEAR = 74400000;

    // Translation Dictionary
    const translations = {
        vi: {
            title: "Tính Thuế TNCN Việt Nam",
            subtitle: "Áp dụng từ 01/07/2026",
            gross_income: "Tổng thu nhập",
            tax_period: "KỲ TÍNH THUẾ",
            month: "Tháng",
            year: "Năm",
            dependents: "Số người phụ thuộc",
            net_income: "Thu nhập thực nhận",
            personal_deduction: "Giảm trừ bản thân:",
            dependent_deduction: "Giảm trừ người phụ thuộc:",
            taxable_income: "Thu nhập tính thuế:",
            bracket_header_income: "Mức chịu thuế",
            bracket_header_rate: "Thuế suất",
            bracket_header_tax: "Tiền thuế",
            total_tax: "Tổng thuế:"
        },
        en: {
            title: "Vietnam PIT Calculator",
            subtitle: "Effective from July 1, 2026",
            gross_income: "Gross Income",
            tax_period: "TAX PERIOD",
            month: "Monthly",
            year: "Yearly",
            dependents: "Dependents",
            net_income: "Net Income",
            personal_deduction: "Personal Deduction:",
            dependent_deduction: "Dependent Deduction:",
            taxable_income: "Taxable Income:",
            bracket_header_income: "Tax Bracket",
            bracket_header_rate: "Tax Rate",
            bracket_header_tax: "Tax Amount",
            total_tax: "Total Tax:"
        }
    };

    // State
    let isYearly = true; // Default as per user request
    let currentLang = 'vi';

    // Brackets (Million VND)
    const BRACKETS_MONTHLY = [
        { max: 10000000, rate: 0.05 },
        { max: 30000000, rate: 0.10 },
        { max: 60000000, rate: 0.20 },
        { max: 100000000, rate: 0.30 },
        { max: Infinity, rate: 0.35 }
    ];

    const BRACKETS_YEARLY = [
        { max: 120000000, rate: 0.05 },
        { max: 360000000, rate: 0.10 },
        { max: 720000000, rate: 0.20 },
        { max: 1200000000, rate: 0.30 },
        { max: Infinity, rate: 0.35 }
    ];

    // Format Currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
    };

    // Parse Input
    const parseInput = (str) => {
        if (!str) return 0;
        return parseInt(str.replace(/\D/g, '')) || 0;
    };

    // Set Language
    const setLanguage = (lang) => {
        if (!translations[lang]) return;
        currentLang = lang;

        // Update components with data-i18n
        components.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });

        // Update Active Class
        langOpts.forEach(opt => {
            if (opt.getAttribute('data-lang') === lang) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });

        updateCalculator();
    };

    // Calculate Tax
    const calculatePIT = (taxableIncome, brackets) => {
        if (taxableIncome <= 0) return { totalTax: 0, details: [] };

        let totalTax = 0;
        let previousMax = 0;
        const details = [];

        for (const bracket of brackets) {
            if (taxableIncome > previousMax) {
                const upperLimit = bracket.max === Infinity ? taxableIncome : Math.min(taxableIncome, bracket.max);
                const taxableAmount = upperLimit - previousMax;
                const tax = taxableAmount * bracket.rate;

                totalTax += tax;

                details.push({
                    max: bracket.max,
                    rate: bracket.rate,
                    amount: taxableAmount,
                    tax: tax
                });

                previousMax = bracket.max;
            } else {
                break;
            }
        }
        return { totalTax, details };
    };

    const updateCalculator = () => {
        const gross = parseInput(grossIncomeInput.value);
        const dependents = parseInt(dependentsInput.value) || 0;
        isYearly = periodToggle.checked;

        const personalDeduction = isYearly ? DEDUCTION_PERSONAL_YEAR : DEDUCTION_PERSONAL_MONTH;
        const dependentDeductionUnit = isYearly ? DEDUCTION_DEPENDENT_YEAR : DEDUCTION_DEPENDENT_MONTH;
        const totalDependentDeduction = dependents * dependentDeductionUnit;

        const taxableIncome = Math.max(0, gross - personalDeduction - totalDependentDeduction);

        const brackets = isYearly ? BRACKETS_YEARLY : BRACKETS_MONTHLY;
        const result = calculatePIT(taxableIncome, brackets);
        const tax = result.totalTax;
        const net = gross - tax;

        // Update UI
        netIncomeEl.textContent = formatCurrency(net);

        personalDeductionEl.textContent = formatCurrency(personalDeduction);
        dependentDeductionEl.textContent = formatCurrency(totalDependentDeduction);
        taxableIncomeEl.textContent = formatCurrency(taxableIncome);

        // Render Bracket Details
        const bracketBreakdownEl = document.getElementById('bracketBreakdown');
        bracketBreakdownEl.innerHTML = '';

        if (result.details.length > 0) {
            const table = document.createElement('div');
            table.className = 'bracket-table';

            // Header
            const header = document.createElement('div');
            header.className = 'bracket-row header';
            header.innerHTML = `
                <span>${translations[currentLang].bracket_header_income}</span>
                <span>${translations[currentLang].bracket_header_rate}</span>
                <span>${translations[currentLang].bracket_header_tax}</span>
            `;
            table.appendChild(header);

            result.details.forEach(detail => {
                const row = document.createElement('div');
                row.className = 'bracket-row';
                const ratePercent = (detail.rate * 100) + '%';

                row.innerHTML = `
                    <span>${formatCurrency(detail.amount)}</span>
                    <span>${ratePercent}</span>
                    <span>${formatCurrency(detail.tax)}</span>
                `;
                table.appendChild(row);
            });

            // Footer - Total Tax
            const footer = document.createElement('div');
            footer.className = 'bracket-row footer';
            footer.style.display = 'flex';
            footer.style.justifyContent = 'space-between';
            footer.style.alignItems = 'center';
            footer.style.borderTop = '1px solid var(--border-color)';
            footer.style.marginTop = '4px';
            footer.style.paddingTop = '8px';

            footer.innerHTML = `
                <span style="font-weight: 700; color: var(--text-secondary);">${translations[currentLang].total_tax}</span>
                <span style="font-weight: 700; color: var(--primary-color); font-size: 16px;">${formatCurrency(tax)}</span>
            `;
            table.appendChild(footer);

            bracketBreakdownEl.appendChild(table);
        }
    };

    // Input Formatting on Type
    grossIncomeInput.addEventListener('input', (e) => {
        const val = parseInput(e.target.value);
        if (val === 0 && e.target.value === '') {
            // do nothing
        } else {
            e.target.value = new Intl.NumberFormat('vi-VN').format(val);
        }
        updateCalculator();
    });

    // Event Listeners
    periodToggle.addEventListener('change', updateCalculator);
    dependentsInput.addEventListener('input', updateCalculator);

    btnDecrement.addEventListener('click', () => {
        const current = parseInt(dependentsInput.value) || 0;
        if (current > 0) {
            dependentsInput.value = current - 1;
            updateCalculator();
        }
    });

    btnIncrement.addEventListener('click', () => {
        const current = parseInt(dependentsInput.value) || 0;
        dependentsInput.value = current + 1;
        updateCalculator();
    });

    // Language Toggle Listeners
    langOpts.forEach(opt => {
        opt.addEventListener('click', () => {
            const lang = opt.getAttribute('data-lang');
            setLanguage(lang);
        });
    });

    // Reset toggle on load to ensure valid state (Yearly default)
    periodToggle.checked = true;

    // Initial Calc
    updateCalculator();
});
