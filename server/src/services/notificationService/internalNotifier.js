const prisma = require('../../lib/prisma');

exports.createAppointmentNotification = async (appointment) => {
    try {
        const title = "Novo Agendamento Confirmado";
        const message = `Agendamento para ${new Date(appointment.date).toLocaleDateString('pt-BR')} às ${appointment.date.toISOString().split('T')[1].substring(0, 5)} com ${appointment.professional.name}.`;

        // Notify Professional
        await prisma.notification.create({
            data: {
                userId: appointment.professional.id,
                title,
                message,
                type: 'appointment',
                appointmentId: appointment.id
            }
        });

        // Notify Client (if linked to an auth user?) - For now, clients see it in "MyAppointments" usually, but we can add notification if Client Model supported it fully.
        // The Notification model has clientId.
        await prisma.notification.create({
            data: {
                clientId: appointment.clientId,
                title: "Agendamento Confirmado!",
                message: `Seu horário foi reservado em ${appointment.barbershop.name}.`,
                type: 'appointment',
                appointmentId: appointment.id
            }
        });

    } catch (error) {
        throw new Error(`Internal Notifier Error: ${error.message}`);
    }
};

exports.createReminderNotification = async (appointment) => {
    try {
        await prisma.notification.create({
            data: {
                clientId: appointment.clientId,
                title: "Lembrete de Horário ⏰",
                message: `Seu corte é em 1 hora na ${appointment.barbershop.name}.`,
                type: 'reminder',
                appointmentId: appointment.id
            }
        });
    } catch (error) {
        throw new Error(`Internal Reminder Error: ${error.message}`);
    }
};
