// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
// import { Colors } from '../../constants/Colors'; 

// interface DebugComponentProps {
//   formData: any;
//   stats: any;
//   profileImage: string | null;
//   errors: any;
//   currentStep: number;
//   canContinue: () => boolean;
// }

// const DebugComponent: React.FC<DebugComponentProps> = ({
//   formData,
//   stats,
//   profileImage,
//   errors,
//   currentStep,
//   canContinue
// }) => {
//   if (!__DEV__) return null; 

//   const showDebugInfo = () => {
//     const debugInfo = {
//       currentStep,
//       canContinue: canContinue(),
//       formData: {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email: formData.email,
//         hasPassword: !!formData.password,
//         hasConfirmPassword: !!formData.confirmPassword,
//         passwordsMatch: formData.password === formData.confirmPassword,
//         phone: formData.phone,
//         gender: formData.gender,
//         birthDate: formData.birthDate,
//         department: formData.department,
//         city: formData.city,
//         nickname: formData.nickname,
//         position: formData.position,
//         height: formData.height,
//         weight: formData.weight,
//       },
//       stats,
//       hasProfileImage: !!profileImage,
//       profileImageUri: profileImage,
//       formErrors: errors,
//       hasFormErrors: Object.keys(errors).length > 0,
//       timestamp: new Date().toLocaleTimeString()
//     };

//     console.log("🐛 DEBUG INFO COMPLETA:", JSON.stringify(debugInfo, null, 2));
    
//     Alert.alert(
//       "🐛 Debug Info",
//       `Step: ${currentStep}
// Can Continue: ${canContinue()}
// Form Errors: ${Object.keys(errors).length}
// Has Image: ${!!profileImage}
// Email: ${formData.email || 'NO EMAIL'}
// Password: ${formData.password ? 'HAS PASSWORD' : 'NO PASSWORD'}

// Ver consola para detalles completos.`,
//       [{ text: "OK" }]
//     );
//   };

//   const testService = async () => {
//     console.log("🧪 Testing service directly...");
    
//     try {
//       // Simular datos mínimos para test
//       const testData = {
//         firstName: "Test",
//         lastName: "User",
//         documentType: "cedula",
//         documentNumber: "12345678",
//         email: "test@email.com",
//         password: "password123",
//         confirmPassword: "password123",
//         phone: "3001234567",
//         gender: "male",
//         birthDate: new Date("1990-01-01"),
//         department: "meta",
//         city: "Villavicencio",
//         nickname: "TestUser",
//         position: "midfielder" as any,
//         height: 175,
//         weight: 70,
//       };

//       const testStats = {
//         pace: 30,
//         shooting: 30,
//         passing: 30,
//         dribbling: 30,
//         defending: 30,
//         physical: 30,
//       };

//       console.log("🧪 Calling service with test data...");
      
//       const { playerService } = await import('../../services/playerService'); 
      
//       const result = await playerService.createPlayerWithValidation(
//         testData,
//         testStats
//       );

//       console.log("🧪 Service test result:", result);
      
//       Alert.alert(
//         "🧪 Service Test",
//         `Success: ${result.success}
// Message: ${result.message}
// Errors: ${result.errors?.join(', ') || 'None'}`,
//         [{ text: "OK" }]
//       );

//     } catch (error) {
//       console.error("🧪 Service test error:", error);
//       Alert.alert("🧪 Service Test Error", error instanceof Error ? error.message : "Unknown error");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>🐛 DEBUG MODE</Text>
      
//       <View style={styles.row}>
//         <TouchableOpacity style={styles.button} onPress={showDebugInfo}>
//           <Text style={styles.buttonText}>Ver Debug Info</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={testService}>
//           <Text style={styles.buttonText}>Test Service</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.statusRow}>
//         <View style={[styles.statusItem, canContinue() ? styles.statusGood : styles.statusBad]}>
//           <Text style={styles.statusText}>Can Continue: {canContinue() ? '✅' : '❌'}</Text>
//         </View>
        
//         <View style={[styles.statusItem, Object.keys(errors).length === 0 ? styles.statusGood : styles.statusBad]}>
//           <Text style={styles.statusText}>Form Valid: {Object.keys(errors).length === 0 ? '✅' : '❌'}</Text>
//         </View>
//       </View>

//       {Object.keys(errors).length > 0 && (
//         <View style={styles.errorsContainer}>
//           <Text style={styles.errorsTitle}>Errores del formulario:</Text>
//           {Object.entries(errors).map(([field, error]: [string, any]) => (
//             <Text key={field} style={styles.errorText}>
//               • {field}: {error?.message || error}
//             </Text>
//           ))}
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#1a1a1a',
//     margin: 16,
//     padding: 16,
//     borderRadius: 8,
//     borderWidth: 2,
//     borderColor: '#ff6b35',
//   },
//   title: {
//     color: '#ff6b35',
//     fontSize: 16,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 12,
//   },
//   row: {
//     flexDirection: 'row',
//     gap: 8,
//     marginBottom: 12,
//   },
//   button: {
//     flex: 1,
//     backgroundColor: '#ff6b35',
//     padding: 12,
//     borderRadius: 6,
//     alignItems: 'center',
//   },
//   secondaryButton: {
//     backgroundColor: '#4a9eff',
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 12,
//   },
//   statusRow: {
//     flexDirection: 'row',
//     gap: 8,
//     marginBottom: 12,
//   },
//   statusItem: {
//     flex: 1,
//     padding: 8,
//     borderRadius: 4,
//     alignItems: 'center',
//   },
//   statusGood: {
//     backgroundColor: '#22c55e',
//   },
//   statusBad: {
//     backgroundColor: '#ef4444',
//   },
//   statusText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   errorsContainer: {
//     backgroundColor: '#2a1a1a',
//     padding: 12,
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: '#ef4444',
//   },
//   errorsTitle: {
//     color: '#ef4444',
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   errorText: {
//     color: '#fca5a5',
//     fontSize: 12,
//     marginBottom: 4,
//   },
// });

// export default DebugComponent;