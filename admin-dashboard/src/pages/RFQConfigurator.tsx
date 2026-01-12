import { useState } from 'react';
import {
    Settings2,
    Plus,
    Trash2,
    Type,
    Save,
    ChevronRight,
    HelpCircle
} from 'lucide-react';

const RFQConfigurator = () => {
    const [fields, setFields] = useState([
        { id: 1, label: 'Estimated Capacity Needed', type: 'text', required: true, options: [] },
        { id: 2, label: 'Project Timeline', type: 'select', required: true, options: ['1-3 Months', '3-6 Months', 'Budgetary Only'] }
    ]);

    const addField = () => {
        const newField = {
            id: Date.now(),
            label: '',
            type: 'text',
            required: false,
            options: []
        };
        setFields([...fields, newField]);
    };

    const removeField = (id: number) => {
        setFields(fields.filter(f => f.id !== id));
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">Dynamic RFQ Configurator</h2>
                    <p className="text-gray-500 mt-1 font-medium italic font-sans">Define project-specific technical enquiry parameters for Section 7.2 compliance</p>
                </div>
                <button className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1">
                    <Save className="w-5 h-5" />
                    <span>Deploy Form Configuration</span>
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                            <h4 className="text-xl font-bold text-gray-900">Form Structure</h4>
                            <button
                                onClick={addField}
                                className="p-3 bg-gray-50 text-primary hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-10 space-y-8">
                            {fields.map((field, index) => (
                                <div key={field.id} className="relative group p-8 bg-gray-50/50 rounded-[32px] border border-gray-100 hover:border-primary/20 transition-all">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Field Label (Visible to user)</label>
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl outline-none font-bold text-gray-700"
                                                value={field.label}
                                                onChange={(e) => {
                                                    const newFields = [...fields];
                                                    newFields[index].label = e.target.value;
                                                    setFields(newFields);
                                                }}
                                                placeholder="e.g. Operating Pressure Requirement"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Input Methodology</label>
                                            <select className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl outline-none font-bold">
                                                <option value="text">Text Input (Short)</option>
                                                <option value="textarea">Technical Narrative (Long)</option>
                                                <option value="select">Selection Dropdown</option>
                                                <option value="number">Numeric Quantification</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-3 cursor-pointer mt-6">
                                                <input type="checkbox" checked={field.required} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" onChange={() => {
                                                    const newFields = [...fields];
                                                    newFields[index].required = !newFields[index].required;
                                                    setFields(newFields);
                                                }} />
                                                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Mandatory</span>
                                            </label>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeField(field.id)}
                                        className="absolute -top-3 -right-3 p-2 bg-white text-red-500 rounded-full shadow-md border border-red-50 hover:bg-red-50 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {fields.length === 0 && (
                                <div className="py-20 text-center text-gray-400">
                                    <Type className="w-16 h-16 mx-auto mb-6 opacity-10" />
                                    <p className="text-xl font-bold">Initiate RFQ scaling by adding fields</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preview / Rules */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-secondary-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <Settings2 className="w-12 h-12 text-primary mb-8" />
                            <h4 className="text-2xl font-bold mb-6">Goverance Logic</h4>
                            <ul className="space-y-6">
                                {[
                                    'Changes reflect instantly on product pages',
                                    'No database schema changes required',
                                    'Supports unlimited technical parameters',
                                    'Automated validation per field type'
                                ].map((rule, i) => (
                                    <li key={i} className="flex items-start gap-4 text-sm font-medium text-secondary-300">
                                        <ChevronRight className="w-5 h-5 text-primary shrink-0" />
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    </div>

                    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 text-amber-500 mb-6">
                            <HelpCircle className="w-6 h-6" />
                            <span className="text-sm font-black uppercase tracking-widest">System Tip</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed font-medium">
                            Use "Selection Dropdowns" for critical technical specs like pressure ratings or material grades to ensure standardized lead scoring.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RFQConfigurator;
